using System.Net;
using System.Net.Mail;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.EntityFrameworkCore;
using RightPixel.Domain;
using RightPixel.Application;
using RightPixel.Infrastructure;
namespace RightPixel.Api.Endpoints;

public record RegisterRequest(string Email, string PlayerName, string AvatarId);
public record EmailRequest(string Email);
public record VerifyRequest(string Email, string Code);
public static class AuthEndpoints
{
    public static string Hash(string value, IConfiguration config) => Convert.ToHexString(HMACSHA256.HashData(
        Convert.FromBase64String(config["Auth:CodeKey"] ?? throw new InvalidOperationException("Auth:CodeKey is required.")), Encoding.UTF8.GetBytes(value)));
    public static void MapAuthApi(this WebApplication app)
    {
        PasswordEndpoints.Map(app);
        var auth = app.MapGroup("/api/auth").RequireRateLimiting("auth");
        auth.MapGet("/pending", async (HttpContext c, IDataProtectionProvider protection, GameDbContext db, TimeProvider clock) =>
        {
            string? email=null;
            try { if(c.Request.Cookies["RightPixel.Pending"] is { } cookie) email=protection.CreateProtector("RightPixel.PendingEmail").Unprotect(cookie); } catch(CryptographicException) { }
            var challenge=email is null?null:await db.Set<EmailChallenge>().FindAsync(email);var now=clock.GetUtcNow().UtcDateTime;
            return Results.Ok(new { email, remainingSeconds=challenge is null?0:Math.Max(0,(int)Math.Ceiling((challenge.NextSendAt-now).TotalSeconds)), serverTime=now });
        });
        auth.MapGet("/csrf", (HttpContext c, IAntiforgery csrf) => Results.Ok(new { token = csrf.GetAndStoreTokens(c).RequestToken }));
        auth.MapPost("/register", (RegisterRequest r, HttpContext c, GameDbContext db, IConfiguration cfg, TimeProvider clock, IEmailSender sender) => Send(r.Email, r, c, db, cfg, clock, sender));
        auth.MapPost("/code", (EmailRequest r, HttpContext c, GameDbContext db, IConfiguration cfg, TimeProvider clock, IEmailSender sender) => Send(r.Email, null, c, db, cfg, clock, sender));
        auth.MapPost("/resend", (EmailRequest r, HttpContext c, GameDbContext db, IConfiguration cfg, TimeProvider clock, IEmailSender sender) => Send(r.Email, null, c, db, cfg, clock, sender));
        auth.MapPost("/verify", async (VerifyRequest r, HttpContext c, GameDbContext db, IConfiguration cfg, TimeProvider clock) =>
        {
            var email = Normalize(r.Email);
            if (email is null || r.Code is null || r.Code.Length != 6 || !r.Code.All(char.IsAsciiDigit)) return Results.BadRequest(new { title = "کد یا ایمیل معتبر نیست." });
            await using var tx = await db.Database.BeginTransactionAsync();
            await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({email}, 0))");
            var now = clock.GetUtcNow().UtcDateTime;
            var challenge = await db.Set<EmailChallenge>().FindAsync(email);
            if (challenge is null || challenge.ExpiresAt <= now || challenge.FailedAttempts >= 5 || challenge.CodeHash.Length == 0)
                return Results.BadRequest(new { title = "کد نامعتبر یا منقضی شده است." });
            if (!CryptographicOperations.FixedTimeEquals(Convert.FromHexString(challenge.CodeHash), Convert.FromHexString(Hash(email + ":" + r.Code, cfg))))
            {
                challenge.FailedAttempts++;
                await db.SaveChangesAsync(); await tx.CommitAsync();
                return Results.BadRequest(new { title = "کد نامعتبر یا منقضی شده است." });
            }
            var player = await db.PlayerProfiles.SingleOrDefaultAsync(x => x.NormalizedEmail == email);
            challenge.CodeHash = "";
            if (player is null) { await db.SaveChangesAsync(); await tx.CommitAsync(); return Results.BadRequest(new { title = "ابتدا ثبت‌نام را تکمیل کن." }); }
            player.EmailConfirmed = true;
            var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
            db.Add(new PasswordGrant { Id=Guid.NewGuid(), PlayerId=player.Id, TokenHash=Hash(token,cfg), ExpiresAt=now.AddMinutes(10) });
            await db.SaveChangesAsync(); await tx.CommitAsync();
            c.Response.Cookies.Delete("RightPixel.Pending",new CookieOptions {Path="/api/auth"});
            c.Response.Cookies.Append("RightPixel.PasswordGrant",token,new CookieOptions {HttpOnly=true,Secure=c.Request.IsHttps,SameSite=SameSiteMode.Strict,Path="/api/auth",MaxAge=TimeSpan.FromMinutes(10)});
            return Results.Ok(new { authenticated = false, requiresPasswordSetup=true });
        });
        auth.MapGet("/session", (HttpContext c) => Results.Ok(new { authenticated = c.User.Identity?.IsAuthenticated == true }));
        auth.MapPost("/logout", async (HttpContext c, GameDbContext db) =>
        {
            if (Guid.TryParse(c.User.FindFirstValue("session"), out var id) && await db.Set<PlayerSession>().FindAsync(id) is { } session) { session.Revoked = true; await db.SaveChangesAsync(); }
            await c.SignOutAsync(); return Results.Ok(new { authenticated = false });
        });
    }
    static string? Normalize(string? value)
    {
        value = value?.Trim();
        return value is { Length: <= 254 } && MailAddress.TryCreate(value, out var address) && address.Address == value ? value.ToLowerInvariant() : null;
    }
    static async Task<IResult> Send(string input, RegisterRequest? registration, HttpContext c, GameDbContext db, IConfiguration cfg, TimeProvider clock, IEmailSender sender)
    {
        var email = Normalize(input);
        if (email is null) return Results.BadRequest(new { title = "ایمیل معتبر وارد کن." });
        if (registration is not null && (string.IsNullOrWhiteSpace(registration.PlayerName) || registration.PlayerName.Trim().Length > 50 || registration.AvatarId is null || !System.Text.RegularExpressions.Regex.IsMatch(registration.AvatarId, @"^avatar-(0[1-9]|[1-3][0-9]|4[0-8])$"))) return Results.BadRequest(new { title = "نام یا شخصیت معتبر نیست." });
        var protector=c.RequestServices.GetRequiredService<IDataProtectionProvider>().CreateProtector("RightPixel.PendingEmail");
        c.Response.Cookies.Append("RightPixel.Pending",protector.Protect(email),new CookieOptions {HttpOnly=true,Secure=c.Request.IsHttps,SameSite=SameSiteMode.Strict,Path="/api/auth",MaxAge=TimeSpan.FromMinutes(15)});
        var ip = Hash(c.Connection.RemoteIpAddress?.ToString() ?? "unknown", cfg);
        var now = clock.GetUtcNow().UtcDateTime;
        var code = RandomNumberGenerator.GetInt32(1000000).ToString("D6");
        await using (var tx = await db.Database.BeginTransactionAsync())
        {
            // Always acquire IP before email to serialize both durable limits without deadlocks.
            await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({ip}, 0))");
            await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({email}, 0))");
            var challenge = await db.Set<EmailChallenge>().FindAsync(email);
            var remaining = challenge is null ? 0 : Math.Max(0, (int)Math.Ceiling((challenge.NextSendAt - now).TotalSeconds));
            if (remaining > 0) { c.Response.Headers.RetryAfter = remaining.ToString(); return Results.Json(new { title = $"ارسال مجدد پس از {remaining} ثانیه", remainingSeconds = remaining, serverTime = now }, statusCode: 429); }
            var recent = db.Set<EmailDelivery>().Where(x => x.SentAt > now.AddHours(-1));
            if (await recent.CountAsync(x => x.Email == email) >= 5 || await recent.CountAsync(x => x.IpHash == ip) >= 100) { c.Response.Headers.RetryAfter = "3600"; return Results.Json(new { title = "سقف ارسال ساعتی پر شده است.", remainingSeconds = 3600, serverTime = now }, statusCode: 429); }
            if (registration is not null && !await db.PlayerProfiles.AnyAsync(x => x.NormalizedEmail == email))
                db.Add(new PlayerProfile { Id = Guid.NewGuid(), Email = input.Trim(), NormalizedEmail = email, PlayerName = registration.PlayerName.Trim(), AvatarId = registration.AvatarId! });
            if (challenge is null) { challenge = new EmailChallenge { Email = email }; db.Add(challenge); }
            challenge.CodeHash = Hash(email + ":" + code, cfg); challenge.ExpiresAt = now.AddSeconds(120); challenge.NextSendAt = now.AddSeconds(120); challenge.FailedAttempts = 0;
            db.Add(new EmailDelivery { Id = Guid.NewGuid(), Email = email, IpHash = ip, SentAt = now });
            await db.SaveChangesAsync(); await tx.CommitAsync();
        }

        try
        {
            await sender.SendCode(email, code);
        }
        catch (Exception e) when (e is SmtpException or TimeoutException or System.Net.Sockets.SocketException)
        { return Results.Json(new {title="ارسال ایمیل تأیید نشد. اگر کد رسید وارد کن؛ برای ارسال دوباره، شمارش معکوس رو ببین.",remainingSeconds=Math.Max(0,(int)Math.Ceiling((now.AddSeconds(120)-clock.GetUtcNow().UtcDateTime).TotalSeconds)),serverTime=clock.GetUtcNow().UtcDateTime},statusCode:503); }
        return Results.Ok(new { remainingSeconds = Math.Max(0,(int)Math.Ceiling((now.AddSeconds(120)-clock.GetUtcNow().UtcDateTime).TotalSeconds)), serverTime = clock.GetUtcNow().UtcDateTime, expiresAt = now.AddSeconds(120) });
    }
}
