namespace ExTrack.API.DTOs;

public class ExpenseDto
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public string? Description { get; set; }
    public DateTime Date { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = null!;
}
