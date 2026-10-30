using RightPixel.Application;
using RightPixel.Domain;
using System.Text.Json;
namespace RightPixel.Api.Tests;

public class ApplicationUnitTests
{
    [Fact]
    public async Task StartAnswerAndReplayWorkWithoutHttpOrDatabase()
    {
        var data = new MemoryWorkspace();
        data.PlayerProfiles.Add(new()
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111")
        });
        data.AllWorlds.Add(new()
        {
            Id = "w"
        });
        data.AllStages.Add(new()
        {
            Id = "s",
            WorldId = "w",
            StageNumber = 1
        });
        data.AllNodes.Add(new()
        {
            Id = "n",
            StageId = "s",
            Type = NodeType.dialogue_lore,
            XpReward = 25,
            PayloadJson = "{\"dialogues\":[\"lesson\"],\"keyTakeaway\":\"key\"}"
        });
        var clock = new Clock();
        var player = new PlayerService(data, new Current());
        var service = new PlayService(data, player, clock, new Current());
        var start = await service.Start("n");
        var id = JsonSerializer.SerializeToElement(start.Value, DataJson.Options).GetProperty("attemptId").GetGuid();
        var request = new AnswerRequest(id, JsonSerializer.SerializeToElement(true));
        var first = await service.Answer("n", request);
        var second = await service.Answer("n", request);
        Assert.Null(first.Kind);
        Assert.Null(second.Kind);
        Assert.Equal(25, (await player.Read()).Xp);
        Assert.Equal(1, Assert.Single(data.PlayerNodeProgress).Attempts);
        Assert.Equal(clock.GetUtcNow().UtcDateTime, Assert.Single(data.GameAttempts).StartedAt);
        var retryStart=JsonSerializer.SerializeToElement((await service.Start("n")).Value,DataJson.Options);
        var wrong=new AnswerRequest(retryStart.GetProperty("attemptId").GetGuid(),JsonSerializer.SerializeToElement(false));
        var failed=JsonSerializer.SerializeToElement((await service.Answer("n",wrong)).Value,DataJson.Options);
        var replay=JsonSerializer.SerializeToElement((await service.Answer("n",wrong)).Value,DataJson.Options);
        Assert.False(failed.GetProperty("nodeCompleted").GetBoolean());
        Assert.False(replay.GetProperty("nodeCompleted").GetBoolean());

    }
    [Fact]
    public void PublicCluesOnlyContainUnlockedText()
    {
        var data=new MemoryWorkspace();var current=new Current();
        var node=new Node {Id="n",Type=NodeType.who_am_i,PayloadJson="{\"clues\":[\"first\",\"secret\"],\"options\":[\"a\"],\"correctAnswer\":\"a\"}"};
        var initial=AccessPolicy.PublicNode(data,current.Id,node).Payload;
        Assert.Equal(1,initial.GetProperty("clues").GetArrayLength());Assert.Equal(2,initial.GetProperty("clueCount").GetInt32());Assert.DoesNotContain("secret",initial.GetRawText());
        data.PlayerNodeUnlocks.Add(new(){PlayerId=current.Id,NodeId="n",CluesRevealed=2});
        Assert.Equal(2,AccessPolicy.PublicNode(data,current.Id,node).Payload.GetProperty("clues").GetArrayLength());
    }
    sealed class Current : ICurrentPlayer { public Guid Id => Guid.Parse("11111111-1111-1111-1111-111111111111"); }
    sealed class Clock : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => DateTimeOffset.UnixEpoch.AddDays(100);
    }
    sealed class MemoryWorkspace : IGameWorkspace
    {
        public List<PlayerCheckpoint> PlayerCheckpoints { get; } = [];
        public List<PlayerProfile> PlayerProfiles { get; } = []; public List<World> AllWorlds { get; } = []; public List<Stage> AllStages { get; } = []; public List<Node> AllNodes { get; } = [];
        public IEnumerable<World> Worlds => AllWorlds; public IEnumerable<Stage> Stages => AllStages; public IEnumerable<Node> Nodes => AllNodes;
        public List<PlayerNodeProgress> PlayerNodeProgress { get; } = []; public List<PlayerNodeUnlock> PlayerNodeUnlocks { get; } = []; public List<GameAttempt> GameAttempts { get; } = []; public List<ShopReceipt> ShopReceipts { get; } = [];
        public bool InTransaction => true; public Task SaveChangesAsync() => Task.CompletedTask; public Task<IWorkspaceTransaction> BeginWrite() => Task.FromResult<IWorkspaceTransaction>(new Transaction()); public Task<IWorkspaceTransaction> BeginRead() => BeginWrite();
        sealed class Transaction : IWorkspaceTransaction
        {
            public Task CommitAsync() => Task.CompletedTask; public ValueTask DisposeAsync() => ValueTask.CompletedTask;
        }
    }
}
