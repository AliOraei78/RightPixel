namespace RightPixel.Domain;
public class EmailChallenge
{
    public string Email { get; set; } = "";
    public string CodeHash { get; set; } = "";
    public DateTime ExpiresAt { get; set; }
    public DateTime NextSendAt { get; set; }
    public int FailedAttempts { get; set; }
}
public class EmailDelivery
{
    public Guid Id { get; set; }
    public string Email { get; set; } = "";
    public string IpHash { get; set; } = "";
    public DateTime SentAt { get; set; }
}
public class PlayerSession
{
    public Guid Id { get; set; }
    public Guid PlayerId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastSeenAt { get; set; }
    public bool Revoked { get; set; }
}

public class PasswordGrant
{
 public Guid Id { get; set; }
 public Guid PlayerId { get; set; }
 public string TokenHash { get; set; } = "";
 public DateTime ExpiresAt { get; set; }
 public bool Used { get; set; }
}
public class LoginFailure
{
 public Guid Id { get; set; }
 public string EmailHash { get; set; } = "";
 public string IpHash { get; set; } = "";
 public DateTime At { get; set; }
}
