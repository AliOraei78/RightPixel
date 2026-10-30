namespace RightPixel.Domain;

public class PlayerNodeUnlock
{
    public Guid PlayerId
    {
        get; set;
    }
    public string NodeId { get; set; } = ""; public int CluesRevealed
    {
        get; set;
    }
    public bool HintPurchased
    {
        get; set;
    }
}
