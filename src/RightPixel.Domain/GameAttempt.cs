namespace RightPixel.Domain;

public class GameAttempt
{
    public int RoundIndex { get; set; }
    public Guid PlayerId { get; set; }
    public Guid Id
    {
        get; set;
    }
    public string NodeId { get; set; } = ""; public DateTime StartedAt
    {
        get; set;
    }
    public bool Resolved
    {
        get; set;
    }
    public string? AnswerHash
    {
        get; set;
    }
    public string? OutcomeJson
    {
        get; set;
    }
}
