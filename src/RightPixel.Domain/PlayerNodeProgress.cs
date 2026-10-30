namespace RightPixel.Domain;

public class PlayerNodeProgress
{
    public Guid PlayerId
    {
        get; set;
    }
    public string NodeId { get; set; } = ""; public int Attempts
    {
        get; set;
    }
    public DateTime? CompletedAt
    {
        get; set;
    }
    public int XpEarned
    {
        get; set;
    }
}
