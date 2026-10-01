using ExTrack.API.Data;
using ExTrack.API.DTOs;
using ExTrack.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ExTrack.API.Services;

public class ExpenseService(AppDbContext context) : IExpenseService
{
    public async Task<IEnumerable<ExpenseDto>> GetExpensesAsync(int? categoryId = null)
    {
        var query = context.Expenses.AsQueryable();

        if (categoryId.HasValue)
        {
            query = query.Where(e => e.CategoryId == categoryId.Value);
        }

        // Projecting into the DTO lets EF build the Category join itself, so no Include is needed
        return await query
            .OrderByDescending(e => e.Date)
            .Select(e => new ExpenseDto
            {
                Id = e.Id,
                Amount = e.Amount,
                Description = e.Description,
                Date = e.Date,
                CategoryId = e.CategoryId,
                CategoryName = e.Category.Name
            })
            .ToListAsync();
    }

    public async Task<ExpenseDto?> GetExpenseByIdAsync(int id)
    {
        // A missing expense is an expected outcome, so return null instead of throwing
        return await context.Expenses
            .Where(e => e.Id == id)
            .Select(e => new ExpenseDto
            {
                Id = e.Id,
                Amount = e.Amount,
                Description = e.Description,
                Date = e.Date,
                CategoryId = e.CategoryId,
                CategoryName = e.Category.Name
            })
            .FirstOrDefaultAsync();
    }

    public async Task<ExpenseDto> CreateExpenseAsync(CreateExpenseRequest request)
    {
        if (request.Amount <= 0)
            throw new ArgumentException("Amount must be greater than 0.");
        if (request.Amount > Expense.MAX_AMOUNT)
            throw new ArgumentException($"Amount cannot exceed {Expense.MAX_AMOUNT}.");
        if (request.Amount != decimal.Round(request.Amount, 2))
            throw new ArgumentException("Amount can have at most 2 decimal places.");
        if (request.Description?.Length > Expense.MAX_DESCRIPTION_LENGTH)
            throw new ArgumentException($"Description cannot exceed {Expense.MAX_DESCRIPTION_LENGTH} characters.");

        var category = await context.Categories.FindAsync(request.CategoryId)
            ?? throw new ArgumentException($"Category ID {request.CategoryId} not found.");

        var expense = new Expense
        {
            Amount = request.Amount,
            Description = request.Description,
            Date = request.Date,
            CategoryId = request.CategoryId
        };

        context.Expenses.Add(expense);
        await context.SaveChangesAsync();

        return new ExpenseDto
        {
            Id = expense.Id,
            Amount = expense.Amount,
            Description = expense.Description,
            Date = expense.Date,
            CategoryId = expense.CategoryId,
            CategoryName = category.Name
        };
    }

    public async Task<ExpenseDto?> UpdateExpenseAsync(int id, UpdateExpenseRequest request)
    {
        if (request.Amount <= 0)
            throw new ArgumentException("Amount must be greater than 0.");
        if (request.Amount > Expense.MAX_AMOUNT)
            throw new ArgumentException($"Amount cannot exceed {Expense.MAX_AMOUNT}.");
        if (request.Amount != decimal.Round(request.Amount, 2))
            throw new ArgumentException("Amount can have at most 2 decimal places.");
        if (request.Description?.Length > Expense.MAX_DESCRIPTION_LENGTH)
            throw new ArgumentException($"Description cannot exceed {Expense.MAX_DESCRIPTION_LENGTH} characters.");

        // Same as GetExpenseByIdAsync: a missing expense returns null instead of throwing
        var expense = await context.Expenses.FindAsync(id);
        if (expense is null)
            return null;

        var category = await context.Categories.FindAsync(request.CategoryId)
            ?? throw new ArgumentException($"Category ID {request.CategoryId} not found.");

        // The entity is tracked by FindAsync, so SaveChangesAsync writes only the changed columns
        expense.Amount = request.Amount;
        expense.Description = request.Description;
        expense.Date = request.Date;
        expense.CategoryId = request.CategoryId;

        await context.SaveChangesAsync();

        return new ExpenseDto
        {
            Id = expense.Id,
            Amount = expense.Amount,
            Description = expense.Description,
            Date = expense.Date,
            CategoryId = expense.CategoryId,
            CategoryName = category.Name
        };
    }

    public async Task<bool> DeleteExpenseAsync(int id)
    {
        var expense = await context.Expenses.FindAsync(id);
        if (expense is null)
            return false;

        context.Expenses.Remove(expense);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<MonthlySummaryDto>> GetMonthlySummaryAsync(int? categoryId = null)
    {
        var query = context.Expenses.AsQueryable();

        if (categoryId.HasValue)
        {
            query = query.Where(e => e.CategoryId == categoryId.Value);
        }

        // Sort on the group key before projecting so EF translates it to a plain GROUP BY ... ORDER BY
        return await query
            .GroupBy(e => new { e.Date.Year, e.Date.Month })
            .OrderByDescending(g => g.Key.Year)
            .ThenByDescending(g => g.Key.Month)
            .Select(g => new MonthlySummaryDto
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Total = g.Sum(e => e.Amount)
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<CategorySummaryDto>> GetCategorySummaryAsync(int? categoryId = null)
    {
        var query = context.Expenses.AsQueryable();

        if (categoryId.HasValue)
        {
            query = query.Where(e => e.CategoryId == categoryId.Value);
        }

        // Category names are unique, so grouping by name gives one row per category.
        // Reading e.Category.Name makes EF add the join, so no Include is needed.
        return await query
            .GroupBy(e => e.Category.Name)
            .Select(g => new CategorySummaryDto
            {
                CategoryName = g.Key,
                Total = g.Sum(e => e.Amount),
                Count = g.Count()
            })
            .OrderByDescending(s => s.Total)
            .ToListAsync();
    }
}
