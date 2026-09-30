namespace ExTrack.API.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Color { get; set; } = "#007BFF";
    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
}
