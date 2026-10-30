namespace RightPixel.Domain;
public class PlayerCheckpoint
{
    public Guid PlayerId { get; set; }
    public string NodeId { get; set; } = "";
    public string StateJson { get; set; } = "{}";
    public long Revision { get; set; }
    public int BossRound { get; set; }
}
