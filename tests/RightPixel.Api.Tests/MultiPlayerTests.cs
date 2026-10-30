using System.Collections.Concurrent;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Npgsql;
using RightPixel.Application;
using RightPixel.Domain;
using RightPixel.Infrastructure;

[assembly: CollectionBehavior(DisableTestParallelization = true)]
namespace RightPixel.Api.Tests;
public sealed class TestClock : TimeProvider
{
    public DateTimeOffset Now = DateTimeOffset.UtcNow;
    public override DateTimeOffset GetUtcNow() => Now;
}
public sealed class TestMail : IEmailSender
{
    public readonly ConcurrentDictionary<string,string> Codes = new();
    public int Sent; public bool Fail;
    public Task SendCode(string email,string code) { if(Fail)throw new System.Net.Mail.SmtpException("Test delivery failure");Codes[email]=code;Interlocked.Increment(ref Sent);return Task.CompletedTask; }
}
public sealed class GameFactory : WebApplicationFactory<Program>
{
    public readonly TestClock Clock = new();
    public readonly TestMail Mail = new();
    public readonly string DatabaseName = "rightpixel_test_"+Guid.NewGuid().ToString("N");
    public string Connection => $"Host=127.0.0.1;Port=15438;Database={DatabaseName};Username=postgres;Password=rightpixel-test-local-only;Pooling=false";
    public GameFactory() {
        using var c=new NpgsqlConnection("Host=127.0.0.1;Port=15438;Database=postgres;Username=postgres;Password=rightpixel-test-local-only");c.Open();using var command=new NpgsqlCommand($"CREATE DATABASE {DatabaseName}",c);command.ExecuteNonQuery();
    }
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.ConfigureAppConfiguration((_,config)=>config.AddInMemoryCollection(new Dictionary<string,string?> {
            ["ConnectionStrings:Game"]=Connection,["Database:InitializeOnStartup"]="true",["Content:InstallBundledCourse"]="true",["Auth:CodeKey"]=Convert.ToBase64String(new byte[32])
        }));
        builder.ConfigureServices(s=>{s.RemoveAll<TimeProvider>();s.AddSingleton<TimeProvider>(Clock);s.RemoveAll<IEmailSender>();s.AddSingleton<IEmailSender>(Mail);});
    }
    public async Task<HttpClient> Login(string email)
    {
        var c=CreateClient();await Csrf(c);
        var response=await c.PostAsJsonAsync("/api/auth/register",new {email,playerName="قهرمان",avatarId="avatar-12"});response.EnsureSuccessStatusCode();
        response=await c.PostAsJsonAsync("/api/auth/verify",new {email,code=Mail.Codes[email]});response.EnsureSuccessStatusCode();
        response=await c.PostAsJsonAsync("/api/auth/password",new {password="UiCheck1!"});response.EnsureSuccessStatusCode();await Csrf(c);
        response=await c.PostAsJsonAsync("/api/auth/login",new {email,password="UiCheck1!",rememberMe=false});response.EnsureSuccessStatusCode();await Csrf(c);return c;
    }
    public static async Task Csrf(HttpClient c) {var token=await c.GetFromJsonAsync<JsonElement>("/api/auth/csrf");c.DefaultRequestHeaders.Remove("X-CSRF-TOKEN");c.DefaultRequestHeaders.Add("X-CSRF-TOKEN",token.GetProperty("token").GetString());}
    protected override void Dispose(bool disposing) {
        base.Dispose(disposing);
        if(disposing){using var c=new NpgsqlConnection("Host=127.0.0.1;Port=15438;Database=postgres;Username=postgres;Password=rightpixel-test-local-only");c.Open();using var command=new NpgsqlCommand($"DROP DATABASE IF EXISTS {DatabaseName} WITH (FORCE)",c);command.ExecuteNonQuery();}
    }
}
public class MultiPlayerTests
{
    [Fact] public async Task EmailCooldownIsSharedAndExactBoundaryWorks()
    {
        using var app=new GameFactory();using var c=app.CreateClient();await GameFactory.Csrf(c);
        var r=await c.PostAsJsonAsync("/api/auth/register",new {email="user@example.com",playerName="نام",avatarId="avatar-01"});Assert.Equal(HttpStatusCode.OK,r.StatusCode);
        app.Clock.Now=app.Clock.Now.AddSeconds(119);
        r=await c.PostAsJsonAsync("/api/auth/code",new {email=" USER@example.com "});Assert.Equal((HttpStatusCode)429,r.StatusCode);Assert.Equal("1",r.Headers.RetryAfter?.ToString());Assert.Equal(1,app.Mail.Sent);
        app.Clock.Now=app.Clock.Now.AddSeconds(1);
        r=await c.PostAsJsonAsync("/api/auth/resend",new {email="user@example.com"});Assert.Equal(HttpStatusCode.OK,r.StatusCode);Assert.Equal(2,app.Mail.Sent);
    }
    [Fact] public async Task CodesAreSingleUseAndUnverifiedAccountsCannotPlay()
    {
        using var app=new GameFactory();using var c=app.CreateClient();await GameFactory.Csrf(c);
        await c.PostAsJsonAsync("/api/auth/register",new {email="user@example.com",playerName="نام",avatarId="avatar-01"});
        Assert.Equal(HttpStatusCode.Unauthorized,(await c.GetAsync("/api/player")).StatusCode);
        var code=app.Mail.Codes["user@example.com"];
        Assert.Equal(HttpStatusCode.OK,(await c.PostAsJsonAsync("/api/auth/verify",new {email="user@example.com",code})).StatusCode);await GameFactory.Csrf(c);
        Assert.Equal(HttpStatusCode.BadRequest,(await c.PostAsJsonAsync("/api/auth/verify",new {email="user@example.com",code})).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized,(await c.GetAsync("/api/player")).StatusCode);
        Assert.Equal(HttpStatusCode.OK,(await c.PostAsJsonAsync("/api/auth/password",new {password="UiCheck1!"})).StatusCode);
        await GameFactory.Csrf(c);
        Assert.Equal(HttpStatusCode.BadRequest,(await c.PostAsJsonAsync("/api/auth/password",new {password="UiCheck2!"})).StatusCode);
        Assert.Equal(HttpStatusCode.OK,(await c.PostAsJsonAsync("/api/auth/login",new {email="user@example.com",password="UiCheck1!",rememberMe=true})).StatusCode);
        await GameFactory.Csrf(c);
        Assert.Equal(HttpStatusCode.OK,(await c.GetAsync("/api/player")).StatusCode);
    }
    [Fact] public async Task FiveBadAttemptsInvalidateCodeAndSmtpFailureDoesNotSucceed()
    {
        using var app=new GameFactory();using var c=app.CreateClient();await GameFactory.Csrf(c);
        await c.PostAsJsonAsync("/api/auth/register",new {email="user@example.com",playerName="نام",avatarId="avatar-01"});
        var real=app.Mail.Codes["user@example.com"];var wrong=real=="000000"?"000001":"000000";
        for(var i=0;i<5;i++)Assert.Equal(HttpStatusCode.BadRequest,(await c.PostAsJsonAsync("/api/auth/verify",new {email="user@example.com",code=wrong})).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest,(await c.PostAsJsonAsync("/api/auth/verify",new {email="user@example.com",code=real})).StatusCode);
        app.Mail.Fail=true;Assert.Equal(HttpStatusCode.ServiceUnavailable,(await c.PostAsJsonAsync("/api/auth/code",new {email="other@example.com"})).StatusCode);
    }
    [Fact] public async Task ConcurrentSendsOnlyDeliverOneEmail()
    {
        using var app=new GameFactory();using var c=app.CreateClient();await GameFactory.Csrf(c);
        var responses=await Task.WhenAll(Enumerable.Range(0,5).Select(_=>c.PostAsJsonAsync("/api/auth/code",new {email="user@example.com"})));
        Assert.Single(responses,r=>r.IsSuccessStatusCode);Assert.Equal(1,app.Mail.Sent);
    }
    [Fact] public async Task PlayersCannotShareAttemptsOrCheckpointsAndLockedContentStaysLocked()
    {
        using var app=new GameFactory();using var a=await app.Login("a@example.com");using var b=await app.Login("b@example.com");
        var start=await (await a.PostAsync("/api/nodes/cs_s01_n0/start",null)).Content.ReadFromJsonAsync<JsonElement>();var id=start.GetProperty("attemptId").GetGuid();
        Assert.Equal(HttpStatusCode.NotFound,(await b.PostAsJsonAsync("/api/nodes/cs_s01_n0/answer",new {attemptId=id,answer=true})).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound,(await b.PatchAsJsonAsync("/api/nodes/cs_s01_n0/checkpoint",new {attemptId=id,revision=0,state=new {dialogueIndex=2,bossRound=99}})).StatusCode);
        Assert.Equal(HttpStatusCode.OK,(await a.PatchAsJsonAsync("/api/nodes/cs_s01_n0/checkpoint",new {attemptId=id,revision=0,state=new {dialogueIndex=2}})).StatusCode);
        var checkpoint=await a.GetFromJsonAsync<JsonElement>("/api/nodes/cs_s01_n0/checkpoint");Assert.Equal(2,checkpoint.GetProperty("state").GetProperty("dialogueIndex").GetInt32());
        Assert.Equal(HttpStatusCode.Conflict,(await a.GetAsync("/api/nodes/cs_s02_n0")).StatusCode);
        var answer=new {attemptId=id,answer=true};Assert.Equal(HttpStatusCode.OK,(await a.PostAsJsonAsync("/api/nodes/cs_s01_n0/answer",answer)).StatusCode);
        var first=await a.GetFromJsonAsync<PlayerStateDto>("/api/player");await a.PostAsJsonAsync("/api/nodes/cs_s01_n0/answer",answer);var replay=await a.GetFromJsonAsync<PlayerStateDto>("/api/player");Assert.Equal(first!.Xp,replay!.Xp);
        var other=await b.GetFromJsonAsync<PlayerStateDto>("/api/player");Assert.Equal(0,other!.Xp);Assert.NotEqual(first.Id,other.Id);
        var node=await a.GetStringAsync("/api/nodes/cs_s01_n1");Assert.DoesNotContain("correctAnswer",node);Assert.DoesNotContain("correctFixIndex",node);
        Assert.Equal(HttpStatusCode.NotFound,(await a.GetAsync("/api/packs")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound,(await a.PostAsJsonAsync("/api/player/backup/restore",new {})).StatusCode);
    }
    [Fact] public async Task EntireCourseAndBossRoundsCompleteWithoutLeakingAnswersOrRepeatingRewards()
    {
        using var app=new GameFactory();using var c=await app.Login("learner@example.com");
        var pack=BundledCourse.Read();
        foreach(var stage in pack.Stages.OrderBy(s=>s.StageNumber)) foreach(var node in stage.Nodes.OrderBy(n=>n.SortOrder))
        {
            var publicNode=await c.GetStringAsync("/api/nodes/"+node.Id);
            foreach(var secret in new[]{"correctAnswer","correctOrder","correctValues","correctPath","correctFixIndex","correctVerdictIndex","solutionCode"}) Assert.DoesNotContain("\""+secret+"\"",publicNode);
            var rounds=node.Type==NodeType.boss_fight?3:1;
            for(var round=0;round<rounds;round++) {
                var startResponse=await c.PostAsync($"/api/nodes/{node.Id}/start",null);startResponse.EnsureSuccessStatusCode();var start=await startResponse.Content.ReadFromJsonAsync<JsonElement>();
                Assert.Equal(node.Type==NodeType.boss_fight?round:0,start.GetProperty("roundIndex").GetInt32());
                var type=node.Type;var payload=node.Payload;
                if(type==NodeType.boss_fight){var part=payload.GetProperty("rounds")[round];type=Enum.Parse<NodeType>(part.GetProperty("type").GetString()!);payload=part.GetProperty("payload");}
                object answer=type switch {
                    NodeType.dialogue_lore=>true,NodeType.who_am_i=>payload.GetProperty("correctAnswer"),NodeType.bug_sniper=>new {line=payload.GetProperty("buggyLineIndex").GetInt32(),fix=payload.GetProperty("correctFixIndex").GetInt32()},
                    NodeType.bomb_defusal=>payload.GetProperty("blanks"),NodeType.compiler_judge=>payload.GetProperty("correctVerdictIndex"),NodeType.code_puzzle=>payload.GetProperty("correctOrderIndices"),
                    NodeType.runtime_forge=>payload.GetProperty("correctOrder"),NodeType.memory_mirror=>payload.GetProperty("correctValues"),NodeType.branch_gates=>payload.GetProperty("correctPath"),_=>throw new Exception("Unsupported test game")
                };
                var request=new {attemptId=start.GetProperty("attemptId").GetGuid(),answer};
                var response=await c.PostAsJsonAsync($"/api/nodes/{node.Id}/answer",request);response.EnsureSuccessStatusCode();var result=await response.Content.ReadFromJsonAsync<JsonElement>();Assert.True(result.GetProperty("correct").GetBoolean());Assert.Equal(round==rounds-1,result.GetProperty("nodeCompleted").GetBoolean());
                if(round<rounds-1){Assert.Equal(0,result.GetProperty("earnedXp").GetInt32());var repeat=await c.PostAsJsonAsync($"/api/nodes/{node.Id}/answer",request);repeat.EnsureSuccessStatusCode();}
            }
        }
        var state=await c.GetFromJsonAsync<PlayerStateDto>("/api/player");Assert.Equal(312,state!.CompletedNodes.Count(p=>p.CompletedAt!=null));
        var repeatedStart=await (await c.PostAsync("/api/nodes/cs_s01_n0/start",null)).Content.ReadFromJsonAsync<JsonElement>();
        var repeatResult=await (await c.PostAsJsonAsync("/api/nodes/cs_s01_n0/answer",new {attemptId=repeatedStart.GetProperty("attemptId").GetGuid(),answer=true})).Content.ReadFromJsonAsync<JsonElement>();Assert.Equal(0,repeatResult.GetProperty("earnedXp").GetInt32());Assert.Equal(0,repeatResult.GetProperty("earnedCoins").GetInt32());
    }
    [Fact] public async Task PendingCountdownAndHourlyQuotaAreDurable()
    {
        using var app=new GameFactory();using var c=app.CreateClient();await GameFactory.Csrf(c);
        await c.PostAsJsonAsync("/api/auth/register",new {email="user@example.com",playerName="نام",avatarId="avatar-01"});
        app.Clock.Now=app.Clock.Now.AddSeconds(20);
        var pending=await c.GetFromJsonAsync<JsonElement>("/api/auth/pending");Assert.Equal("user@example.com",pending.GetProperty("email").GetString());Assert.Equal(100,pending.GetProperty("remainingSeconds").GetInt32());
        app.Clock.Now=app.Clock.Now.AddSeconds(100);
        for(var i=0;i<4;i++){Assert.Equal(HttpStatusCode.OK,(await c.PostAsJsonAsync("/api/auth/resend",new {email="user@example.com"})).StatusCode);app.Clock.Now=app.Clock.Now.AddSeconds(120);}
        Assert.Equal((HttpStatusCode)429,(await c.PostAsJsonAsync("/api/auth/code",new {email="user@example.com"})).StatusCode);Assert.Equal(5,app.Mail.Sent);
    }
    [Fact] public async Task LogoutAndIdleExpiryRevokeAccess()
    {
        using var app=new GameFactory();using var c=await app.Login("user@example.com");
        Assert.Equal(HttpStatusCode.OK,(await c.PostAsync("/api/auth/logout",null)).StatusCode);Assert.Equal(HttpStatusCode.Unauthorized,(await c.GetAsync("/api/player")).StatusCode);
        using var other=await app.Login("other@example.com");app.Clock.Now=app.Clock.Now.AddHours(24);
        Assert.Equal(HttpStatusCode.Unauthorized,(await other.GetAsync("/api/player")).StatusCode);
    }
    [Fact] public async Task ExpiredCodeAndCsrfAreRejected()
    {
        using var app=new GameFactory();using var c=app.CreateClient();
        Assert.Equal(HttpStatusCode.BadRequest,(await c.PostAsJsonAsync("/api/auth/code",new {email="u@example.com"})).StatusCode);await GameFactory.Csrf(c);
        await c.PostAsJsonAsync("/api/auth/register",new {email="user@example.com",playerName="نام",avatarId="avatar-01"});app.Clock.Now=app.Clock.Now.AddSeconds(120);
        Assert.Equal(HttpStatusCode.BadRequest,(await c.PostAsJsonAsync("/api/auth/verify",new {email="user@example.com",code=app.Mail.Codes["user@example.com"]})).StatusCode);
    }
}
