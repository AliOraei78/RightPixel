namespace RightPixel.Domain;

public class Stage
{
    public bool IsArchived
    {
        get; set;
    }
    public string Id { get; set; } = ""; public string WorldId { get; set; } = ""; public string Title { get; set; } = ""; public int StageNumber
    {
        get; set;
    }
    public string BossName { get; set; } = "";
}
