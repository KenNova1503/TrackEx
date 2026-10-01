namespace ExTrack.API.Models;

public class Expense
{
    // Must match the column config in AppDbContext: Amount is decimal(10,2), Description is nvarchar(500)
    public const decimal MAX_AMOUNT = 99_999_999.99m;
    public const int MAX_DESCRIPTION_LENGTH = 500;

    public int Id { get; set; }
    public decimal Amount { get; set; }
    public string? Description { get; set; }
    public DateTime Date { get; set; }
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
