namespace RightPixel.Domain;

public class Node
{
    public bool IsArchived
    {
        get; set;
    }
    public string Id { get; set; } = ""; public string StageId { get; set; } = ""; public int SortOrder
    {
        get; set;
    }
    public NodeType Type
    {
        get; set;
    }
    public string Title { get; set; } = ""; public string NpcName { get; set; } = ""; public string NpcSprite { get; set; } = ""; public int XpReward
    {
        get; set;
    }
    public int? TimeLimitSec
    {
        get; set;
    }
    public string? Hint
    {
        get; set;
    }
    public string? Explanation
    {
        get; set;
    }
    public string PayloadJson { get; set; } = "{}";
}
