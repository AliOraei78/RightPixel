using RightPixel.Domain;
using RightPixel.Application;
using RightPixel.Infrastructure;
namespace RightPixel.Api.Tests;

public class ArchitectureTests
{
    [Fact]
    public void DependencyDirectionIsEnforced()
    {
        Assert.DoesNotContain(typeof(Node).Assembly.GetReferencedAssemblies(), a => a.Name!.StartsWith("RightPixel.") || a.Name.StartsWith("Microsoft.EntityFrameworkCore") || a.Name.StartsWith("Microsoft.AspNetCore"));
        Assert.DoesNotContain(typeof(PlayerService).Assembly.GetReferencedAssemblies(), a => a.Name is "RightPixel.Infrastructure" or "RightPixel.Api" || a.Name!.StartsWith("Microsoft.EntityFrameworkCore") || a.Name.StartsWith("Microsoft.AspNetCore"));
        Assert.DoesNotContain(typeof(GameDbContext).Assembly.GetReferencedAssemblies(), a => a.Name == "RightPixel.Api");
    }
    [Fact]
    public void PublicStateContainsTransferRecords()
    {
        Assert.Equal(typeof(List<ProgressDto>), typeof(PlayerStateDto).GetProperty("CompletedNodes")!.PropertyType);
    }
    [Theory][InlineData(0, 1)][InlineData(199, 1)][InlineData(200, 2)] public void LevelBoundaries(int xp, int level) => Assert.Equal(level, RewardPolicy.Level(xp));
    [Fact]
    public void RewardAndDeadlineRulesArePure()
    {
        Assert.Equal((0, 0), RewardPolicy.Calculate(90, 10, true, true));
        Assert.Equal((0, 0), RewardPolicy.Calculate(90, 1, true, false));
        Assert.Equal((120, 36), RewardPolicy.Calculate(60, 1, false, true));
        Assert.Equal(1, RewardPolicy.LoseLife(1));
        var start = DateTime.UnixEpoch;
        Assert.False(RewardPolicy.Expired(start.AddSeconds(40), start, 40));
        Assert.True(RewardPolicy.Expired(start.AddSeconds(41), start, 40));
    }
    [Fact]
    public void IndependentEvaluatorsPreserveExactSemantics()
    {
        Assert.True(new PuzzleEvaluator().Evaluate(new("", ["a", "b"], [1, 0]), [1, 0]));
        Assert.False(new PuzzleEvaluator().Evaluate(new("", ["a", "b"], [1, 0]), [0, 1]));
        Assert.True(new BombEvaluator().Evaluate(new("", "__1__", ["int"], ["int"]), ["int"]));
    }
    [Fact]
    public void CourseRevisionMatchesPreRefactorContract()
    {
        var pack = BundledCourse.Read();
        Assert.Equal(44, pack.Stages.Count);
        Assert.Equal(312, pack.Stages.Sum(s => s.Nodes.Count));
        Assert.All(pack.Stages, stage => Assert.Equal(7, stage.Nodes.Count(n => !n.Id.EndsWith("_pilot"))));
    }
}
