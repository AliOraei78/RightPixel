using System.Security.Claims;
using Microsoft.AspNetCore.HttpOverrides;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using RightPixel.Api;
using RightPixel.Application;
using RightPixel.Domain;
using RightPixel.Infrastructure;
using RightPixel.Api.Endpoints;
var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(o => o.Limits.MaxRequestBodySize = 2_000_000);
builder.Services.AddExceptionHandler<ApplicationExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();
builder.Services.AddHttpContextAccessor();
builder.Services.Configure<ForwardedHeadersOptions>(o => { o.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto; o.KnownProxies.Add(System.Net.IPAddress.Parse("192.168.240.10")); o.ForwardLimit = 1; });
builder.Services.AddScoped<ICurrentPlayer, CurrentPlayer>();
builder.Services.AddAntiforgery(o => { o.HeaderName = "X-CSRF-TOKEN"; o.Cookie.SecurePolicy = builder.Environment.IsDevelopment() ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always; });
builder.Services.AddRateLimiter(o => { o.RejectionStatusCode = 429; o.AddPolicy("auth", c => RateLimitPartition.GetFixedWindowLimiter(c.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new FixedWindowRateLimiterOptions { PermitLimit = 60, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 })); });
builder.Services.AddDataProtection().SetApplicationName("RightPixel");
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie(o =>
{
    o.Cookie.Name = builder.Environment.IsDevelopment() ? "RightPixel.Session" : "__Host-RightPixel.Session";
    o.Cookie.HttpOnly = true; o.Cookie.SecurePolicy = builder.Environment.IsDevelopment() ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
    o.Cookie.SameSite = SameSiteMode.Strict; o.ExpireTimeSpan = TimeSpan.FromDays(7); o.SlidingExpiration = false;
    o.Events.OnRedirectToLogin = c => { c.Response.StatusCode = 401; return Task.CompletedTask; };
    o.Events.OnRedirectToAccessDenied = c => { c.Response.StatusCode = 403; return Task.CompletedTask; };
    o.Events.OnValidatePrincipal = async c =>
    {
        var db = c.HttpContext.RequestServices.GetRequiredService<GameDbContext>();
        var now = c.HttpContext.RequestServices.GetRequiredService<TimeProvider>().GetUtcNow().UtcDateTime;
        var session = Guid.TryParse(c.Principal?.FindFirstValue("session"), out var id) ? await db.Set<PlayerSession>().FindAsync(id) : null;
        if (session is null || session.Revoked || now - session.CreatedAt >= TimeSpan.FromDays(7) || now - session.LastSeenAt >= TimeSpan.FromHours(24)) { c.RejectPrincipal(); return; }
        session.LastSeenAt = now; await db.SaveChangesAsync();
    };
});
builder.Services.AddAuthorization();
builder.Services.ConfigureHttpJsonOptions(o => o.SerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter()));
builder.Services.AddGameInfrastructure(builder.Configuration.GetConnectionString("Game"));
var app = builder.Build();
if(args.Contains("--migrate-only")) { await app.Services.InitializeGame(true,app.Logger); return; }
if(Convert.FromBase64String(app.Configuration["Auth:CodeKey"] ?? throw new InvalidOperationException("Auth:CodeKey is required.")).Length < 32) throw new InvalidOperationException("Auth:CodeKey must contain at least 32 random bytes.");
if(!app.Environment.IsDevelopment()) foreach(var key in new[] { "Host", "UserName", "Password", "FromEmail" }) if(string.IsNullOrWhiteSpace(app.Configuration["EmailSettings:"+key])) throw new InvalidOperationException("EmailSettings:"+key+" is required.");
app.UseForwardedHeaders();
app.UseExceptionHandler();
app.UseAuthentication(); app.UseAuthorization(); app.UseRateLimiter(); app.UseAntiforgery();
app.Use(async (c, next) =>
{
    if(!app.Environment.IsDevelopment()) c.Response.Headers["Strict-Transport-Security"] = "max-age=31536000";
    c.Response.Headers["X-Content-Type-Options"] = "nosniff";
    c.Response.Headers["Referrer-Policy"] = "no-referrer";
    c.Response.Headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none'; object-src 'none'";
    if (c.Request.Path.StartsWithSegments("/api") && !HttpMethods.IsGet(c.Request.Method) && !HttpMethods.IsHead(c.Request.Method))
    {
        try { await c.RequestServices.GetRequiredService<IAntiforgery>().ValidateRequestAsync(c); }
        catch (AntiforgeryValidationException) { c.Response.StatusCode = 400; return; }
    }
    if (c.Request.Path.StartsWithSegments("/api") && !c.Request.Path.StartsWithSegments("/api/auth") && c.Request.Path != "/api/health" && c.User.Identity?.IsAuthenticated != true) { c.Response.StatusCode = 401; return; }
    await next();
});
if (builder.Configuration.GetValue<bool>("Database:InitializeOnStartup")) await app.Services.InitializeGame(builder.Configuration.GetValue("Content:InstallBundledCourse", true), app.Logger);
if (app.Environment.IsDevelopment()) app.MapOpenApi();
app.MapAuthApi(); app.MapPlayApi(); app.MapGameApi();
app.Run();
public partial class Program;
