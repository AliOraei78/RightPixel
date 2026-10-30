namespace RightPixel.Domain;

public class PlayerProfile
{
    [System.Text.Json.Serialization.JsonIgnore]
    public string? PasswordHash { get; set; }
    public string Email { get; set; } = "";
    public string NormalizedEmail { get; set; } = "";
    public bool EmailConfirmed { get; set; }
    public string AvatarId { get; set; } = "avatar-01";
    public Guid Id
    {
        get; set;
    }
    public string PlayerName { get; set; } = "شوالیه دیباگر";
    public int Xp
    {
        get; set;
    }
    public int Hp { get; set; } = 3;
    public int MaxHp { get; set; } = 3;
    public int Coins { get; set; } = 100;
    public int Streak
    {
        get; set;
    }
    public int BestStreak
    {
        get; set;
    }
    public string? ActiveNodeId
    {
        get; set;
    }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
