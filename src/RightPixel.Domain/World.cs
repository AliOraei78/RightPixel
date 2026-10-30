namespace RightPixel.Domain;

public class World
{
    public bool IsArchived
    {
        get; set;
    }
    public string Id { get; set; } = ""; public string Title { get; set; } = ""; public string Icon { get; set; } = ""; public string Color { get; set; } = ""; public int SortOrder
    {
        get; set;
    }
}
