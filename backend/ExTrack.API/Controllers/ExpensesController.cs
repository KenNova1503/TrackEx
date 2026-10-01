using ExTrack.API.DTOs;
using ExTrack.API.Models;
using ExTrack.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ExTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExpensesController(IExpenseService service, ILogger<ExpensesController> logger) : ControllerBase
{
    /// <summary>
    /// Gets all expenses, newest first, optionally filtered by category.
    /// </summary>
    /// <param name="categoryId">Optional category ID to filter by.</param>
    /// <response code="200">The list of expenses (empty if none match).</response>
    /// <response code="500">An unexpected error occurred.</response>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExpenseDto>>> GetExpenses([FromQuery] int? categoryId = null)
    {
        try
        {
            var expenses = await service.GetExpensesAsync(categoryId);
            return Ok(expenses);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to get expenses (categoryId: {CategoryId})", categoryId);
            return StatusCode(500, new { message = "An unexpected error occurred." });
        }
    }

    /// <summary>
    /// Gets a single expense by ID.
    /// </summary>
    /// <param name="id">The expense ID.</param>
    /// <response code="200">The expense.</response>
    /// <response code="404">No expense exists with that ID.</response>
    /// <response code="500">An unexpected error occurred.</response>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ExpenseDto>> GetExpense(int id)
    {
        try
        {
            var expense = await service.GetExpenseByIdAsync(id);
            if (expense is null)
                return NotFound(new { message = $"Expense with ID {id} not found." });

            return Ok(expense);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to get expense {ExpenseId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred." });
        }
    }

    /// <summary>
    /// Creates a new expense.
    /// </summary>
    /// <param name="request">The expense to create. Description is optional.</param>
    /// <response code="201">The created expense, with a Location header pointing to it.</response>
    /// <response code="400">The amount, description, category or date is invalid.</response>
    /// <response code="500">An unexpected error occurred.</response>
    [HttpPost]
    public async Task<ActionResult<ExpenseDto>> CreateExpense(CreateExpenseRequest request)
    {
        try
        {
            if (request.Amount <= 0)
                return BadRequest(new { message = "Amount must be greater than 0." });
            if (request.Amount > Expense.MAX_AMOUNT)
                return BadRequest(new { message = $"Amount cannot exceed {Expense.MAX_AMOUNT}." });
            if (request.Description?.Length > Expense.MAX_DESCRIPTION_LENGTH)
                return BadRequest(new { message = $"Description cannot exceed {Expense.MAX_DESCRIPTION_LENGTH} characters." });
            if (request.CategoryId <= 0)
                return BadRequest(new { message = "Valid category ID is required." });
            if (request.Date == default)
                return BadRequest(new { message = "Date is required." });

            var expense = await service.CreateExpenseAsync(request);
            return CreatedAtAction(nameof(GetExpense), new { id = expense.Id }, expense);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to create expense");
            return StatusCode(500, new { message = "An unexpected error occurred." });
        }
    }

    /// <summary>
    /// Updates all fields of an existing expense.
    /// </summary>
    /// <param name="id">The expense ID.</param>
    /// <param name="request">The new values. Description is optional.</param>
    /// <response code="200">The updated expense.</response>
    /// <response code="400">The amount, description, category or date is invalid.</response>
    /// <response code="404">No expense exists with that ID.</response>
    /// <response code="500">An unexpected error occurred.</response>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ExpenseDto>> UpdateExpense(int id, UpdateExpenseRequest request)
    {
        try
        {
            if (request.Amount <= 0)
                return BadRequest(new { message = "Amount must be greater than 0." });
            if (request.Amount > Expense.MAX_AMOUNT)
                return BadRequest(new { message = $"Amount cannot exceed {Expense.MAX_AMOUNT}." });
            if (request.Description?.Length > Expense.MAX_DESCRIPTION_LENGTH)
                return BadRequest(new { message = $"Description cannot exceed {Expense.MAX_DESCRIPTION_LENGTH} characters." });
            if (request.CategoryId <= 0)
                return BadRequest(new { message = "Valid category ID is required." });
            if (request.Date == default)
                return BadRequest(new { message = "Date is required." });

            var expense = await service.UpdateExpenseAsync(id, request);
            if (expense is null)
                return NotFound(new { message = $"Expense with ID {id} not found." });

            return Ok(expense);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to update expense {ExpenseId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred." });
        }
    }

    /// <summary>
    /// Deletes an expense.
    /// </summary>
    /// <param name="id">The expense ID.</param>
    /// <response code="204">The expense was deleted.</response>
    /// <response code="404">No expense exists with that ID.</response>
    /// <response code="500">An unexpected error occurred.</response>
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteExpense(int id)
    {
        try
        {
            var deleted = await service.DeleteExpenseAsync(id);
            if (!deleted)
                return NotFound(new { message = $"Expense with ID {id} not found." });

            return NoContent();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to delete expense {ExpenseId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred." });
        }
    }

    /// <summary>
    /// Gets the total spent per month, newest month first, optionally filtered by category.
    /// </summary>
    /// <param name="categoryId">Optional category ID to filter by.</param>
    /// <response code="200">One entry per month that has expenses (empty if none match).</response>
    /// <response code="500">An unexpected error occurred.</response>
    [HttpGet("summary/monthly")]
    public async Task<ActionResult<IEnumerable<MonthlySummaryDto>>> GetMonthlySummary([FromQuery] int? categoryId = null)
    {
        try
        {
            var summary = await service.GetMonthlySummaryAsync(categoryId);
            return Ok(summary);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to get monthly summary (categoryId: {CategoryId})", categoryId);
            return StatusCode(500, new { message = "An unexpected error occurred." });
        }
    }

    /// <summary>
    /// Gets the total spent and number of expenses per category, highest total first, optionally filtered by category.
    /// </summary>
    /// <param name="categoryId">Optional category ID to filter by.</param>
    /// <response code="200">One entry per category that has expenses (empty if none match).</response>
    /// <response code="500">An unexpected error occurred.</response>
    [HttpGet("summary/category")]
    public async Task<ActionResult<IEnumerable<CategorySummaryDto>>> GetCategorySummary([FromQuery] int? categoryId = null)
    {
        try
        {
            var summary = await service.GetCategorySummaryAsync(categoryId);
            return Ok(summary);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to get category summary (categoryId: {CategoryId})", categoryId);
            return StatusCode(500, new { message = "An unexpected error occurred." });
        }
    }
}
