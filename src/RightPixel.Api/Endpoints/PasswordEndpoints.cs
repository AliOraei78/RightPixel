using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using RightPixel.Domain;
using RightPixel.Infrastructure;
namespace RightPixel.Api.Endpoints;
public record PasswordLogin(string Email, string Password, bool RememberMe);
public record SetPassword(string Password);
public static class PasswordEndpoints
{
 static readonly PasswordHasher<PlayerProfile> Hasher = new(Options.Create(new PasswordHasherOptions { CompatibilityMode=PasswordHasherCompatibilityMode.IdentityV3, IterationCount=220000 }));
 static readonly PlayerProfile Dummy = new();
 static readonly string DummyHash = Hasher.HashPassword(Dummy,"dummy-password-for-timing-only");
 public static void Map(WebApplication app)
 {
  var auth=app.MapGroup("/api/auth").RequireRateLimiting("auth");
  auth.MapPost("/login",async (PasswordLogin r,HttpContext c,GameDbContext db,IConfiguration cfg,TimeProvider clock)=> {
   var email=(r.Email??"").Trim().ToLowerInvariant(); var now=clock.GetUtcNow().UtcDateTime;
   if(email.Length>254 || r.Password is null || r.Password.Length>256) return Results.BadRequest(new {title="ایمیل یا رمز درست نیست."});
   var eh=AuthEndpoints.Hash(email,cfg); var ip=AuthEndpoints.Hash(c.Connection.RemoteIpAddress?.ToString()??"unknown",cfg);
   await using var tx=await db.Database.BeginTransactionAsync();
   await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({ip},0))");
   await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({email},0))");
   var failures=db.Set<LoginFailure>().Where(x=>x.At>now.AddMinutes(-15));
   var emailFailures=await failures.Where(x=>x.EmailHash==eh).Select(x=>x.At).ToListAsync();
   var ipFailures=await failures.Where(x=>x.IpHash==ip).Select(x=>x.At).ToListAsync();
   if(emailFailures.Count>=5 || ipFailures.Count>=50) {
    var unlockAt=now;
    if(emailFailures.Count>=5)unlockAt=emailFailures.Min().AddMinutes(15);
    if(ipFailures.Count>=50 && ipFailures.Min().AddMinutes(15)>unlockAt)unlockAt=ipFailures.Min().AddMinutes(15);
    var remaining=Math.Max(1,(int)Math.Ceiling((unlockAt-now).TotalSeconds));
    c.Response.Headers.RetryAfter=remaining.ToString();
    return Results.Json(new {title=$"تلاش‌ها زیاد شده؛ {remaining} ثانیه دیگه امتحان کن.",remainingSeconds=remaining,serverTime=now},statusCode:429);
   }
   var player=await db.PlayerProfiles.SingleOrDefaultAsync(x=>x.NormalizedEmail==email);
   var result=Hasher.VerifyHashedPassword(player??Dummy,player?.PasswordHash??DummyHash,r.Password);
   if(player is null || !player.EmailConfirmed || player.PasswordHash is null || result==PasswordVerificationResult.Failed) {
    db.Add(new LoginFailure {Id=Guid.NewGuid(),EmailHash=eh,IpHash=ip,At=now});await db.SaveChangesAsync();await tx.CommitAsync();
    return Results.Json(new {title="ایمیل یا رمز درست نیست. اگه هنوز رمز نداری، تکمیل حساب رو انتخاب کن."},statusCode:401);
   }
   await failures.Where(x=>x.EmailHash==eh).ExecuteUpdateAsync(s=>s.SetProperty(x=>x.EmailHash,""));
   if(result==PasswordVerificationResult.SuccessRehashNeeded) player.PasswordHash=Hasher.HashPassword(player,r.Password);
   var session=new PlayerSession {Id=Guid.NewGuid(),PlayerId=player.Id,CreatedAt=now,LastSeenAt=now}; db.Add(session);
   await db.SaveChangesAsync();await tx.CommitAsync();await SignIn(c,player,session,r.RememberMe,now);
   return Results.Ok(new {authenticated=true});
  });
  auth.MapPost("/password",async (SetPassword r,HttpContext c,GameDbContext db,IConfiguration cfg,TimeProvider clock)=> {
   if(r.Password is null || r.Password.EnumerateRunes().Count() is <6 or >128 || !r.Password.EnumerateRunes().Any(System.Text.Rune.IsLetter) || !r.Password.EnumerateRunes().Any(System.Text.Rune.IsDigit) || !r.Password.EnumerateRunes().Any(ch=>System.Text.Rune.IsPunctuation(ch)||System.Text.Rune.IsSymbol(ch))) return Results.BadRequest(new {title="رمز باید ۶ تا ۱۲۸ کاراکتر و شامل حرف، عدد و نماد باشه."});
   var token=c.Request.Cookies["RightPixel.PasswordGrant"];
   if(token is null || token.Length!=64)return Results.BadRequest(new {title="اول ایمیلت رو تأیید کن."});
   var hash=AuthEndpoints.Hash(token,cfg);var now=clock.GetUtcNow().UtcDateTime;
   await using var tx=await db.Database.BeginTransactionAsync();
   await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({hash},0))");
   var grant=await db.Set<PasswordGrant>().SingleOrDefaultAsync(x=>x.TokenHash==hash);
   if(grant is null || grant.Used || grant.ExpiresAt<=now)return Results.BadRequest(new {title="فرصت تعیین رمز تموم شده؛ دوباره ایمیلت رو تأیید کن."});
   var player=await db.PlayerProfiles.SingleAsync(x=>x.Id==grant.PlayerId);
   await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({player.NormalizedEmail},0))");
   await db.Entry(grant).ReloadAsync();
   if(grant.Used || grant.ExpiresAt<=clock.GetUtcNow().UtcDateTime)return Results.BadRequest(new {title="این مجوز دیگه معتبر نیست؛ دوباره ایمیلت رو تأیید کن."});
   await db.Entry(player).ReloadAsync();
   var initialSetup=player.PasswordHash is null;
   player.PasswordHash=Hasher.HashPassword(player,r.Password);grant.Used=true;
   var emailHash=AuthEndpoints.Hash(player.NormalizedEmail,cfg);
   await db.Set<LoginFailure>().Where(x=>x.EmailHash==emailHash).ExecuteUpdateAsync(s=>s.SetProperty(x=>x.EmailHash,""));
   await db.Set<PlayerSession>().Where(x=>x.PlayerId==player.Id).ExecuteUpdateAsync(s=>s.SetProperty(x=>x.Revoked,true));
   await db.Set<PasswordGrant>().Where(x=>x.PlayerId==player.Id && x.Id!=grant.Id).ExecuteUpdateAsync(s=>s.SetProperty(x=>x.Used,true));
   PlayerSession? newSession=initialSetup?new PlayerSession {Id=Guid.NewGuid(),PlayerId=player.Id,CreatedAt=now,LastSeenAt=now}:null;
   if(newSession is not null)db.Add(newSession);
   await db.SaveChangesAsync();await tx.CommitAsync();await c.SignOutAsync();
   if(newSession is not null)await SignIn(c,player,newSession,false,now);
   c.Response.Cookies.Delete("RightPixel.PasswordGrant",new CookieOptions {Path="/api/auth"});
   return Results.Ok(new {authenticated=initialSetup,passwordSet=true});
  });
 }
 static Task SignIn(HttpContext c,PlayerProfile p,PlayerSession s,bool remember,DateTime now) => c.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme,new ClaimsPrincipal(new ClaimsIdentity(new[]{new Claim(ClaimTypes.NameIdentifier,p.Id.ToString()),new Claim("session",s.Id.ToString())},CookieAuthenticationDefaults.AuthenticationScheme)),new AuthenticationProperties {IsPersistent=remember,ExpiresUtc=new DateTimeOffset(now.AddDays(7))});
}
