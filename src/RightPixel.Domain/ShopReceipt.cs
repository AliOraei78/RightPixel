namespace RightPixel.Domain;

public class ShopReceipt
{
    public Guid PlayerId { get; set; }
    public Guid Id
    {
        get; set;
    }
    public string Operation { get; set; } = ""; public DateTime CreatedAt
    {
        get; set;
    }
}
