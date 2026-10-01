using ExTrack.API.DTOs;

namespace ExTrack.API.Services;

public interface IExpenseService
{
    Task<IEnumerable<ExpenseDto>> GetExpensesAsync(int? categoryId = null);
    Task<ExpenseDto?> GetExpenseByIdAsync(int id);
    Task<ExpenseDto> CreateExpenseAsync(CreateExpenseRequest request);
    Task<ExpenseDto?> UpdateExpenseAsync(int id, UpdateExpenseRequest request);
    Task<bool> DeleteExpenseAsync(int id);
    Task<IEnumerable<MonthlySummaryDto>> GetMonthlySummaryAsync(int? categoryId = null);
    Task<IEnumerable<CategorySummaryDto>> GetCategorySummaryAsync(int? categoryId = null);
}
