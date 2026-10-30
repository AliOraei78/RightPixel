using RightPixel.Domain;
namespace RightPixel.Application;

public class PlayerService(IGameWorkspace db, ICurrentPlayer current)
{
    public async Task<PlayerStateDto> Read()
    {
        await using var snapshot = await db.BeginRead();
        return ReadSnapshot();
    }
    PlayerStateDto ReadSnapshot()
    {
        var p = db.PlayerProfiles.Single(x => x.Id == current.Id);
        var level = RewardPolicy.Level(p.Xp);
        string[] titles = ["کارآموز سی‌شارپ", "شکارچی باگ‌های Stack", "شوالیه حافظه و ردیس", "جراح کوئری و Async", "فرمانده معماری نرم‌افزار", "افسانه دیباگینگ"];
        return new(2, p.Id, p.PlayerName, p.Xp, level, titles[Math.Min(level - 1, 5)], p.Hp, p.MaxHp, p.Coins, p.Streak, p.BestStreak, p.ActiveNodeId, p.UpdatedAt,
         db.PlayerNodeProgress.Select(DtoMapper.Progress).Where(x => x.PlayerId == current.Id).ToList(), db.PlayerNodeUnlocks.Select(DtoMapper.Unlock).Where(x => x.PlayerId == current.Id).ToList(), p.AvatarId);
    }
}
