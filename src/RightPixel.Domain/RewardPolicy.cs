namespace RightPixel.Domain;

public static class RewardPolicy
{
    public static (int Xp, int Coins) Calculate(int reward, int streak, bool completed, bool doubleReward) => completed ? (0, 0) : ((reward + Math.Min(50, (streak - 1) * 10)) * (doubleReward ? 2 : 1), (15 + streak * 3) * (doubleReward ? 2 : 1));
    public static int Level(int xp) => xp / 200 + 1;
    public static int LoseLife(int hp) => Math.Max(1, hp - 1);
    public static bool Expired(DateTime now, DateTime start, int? seconds) => seconds.HasValue && now > start.AddSeconds(seconds.Value);
}
