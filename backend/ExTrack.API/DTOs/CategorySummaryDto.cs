namespace ExTrack.API.DTOs;

public class CategorySummaryDto
{
    public string CategoryName { get; set; } = null!;
    public decimal Total { get; set; }
    public int Count { get; set; }
}
