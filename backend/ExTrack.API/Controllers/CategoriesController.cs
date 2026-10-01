using ExTrack.API.DTOs;
using ExTrack.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ExTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController(ICategoryService service, ILogger<CategoriesController> logger) : ControllerBase
{
    /// <summary>
    /// Gets all categories.
    /// </summary>
    /// <response code="200">The list of categories.</response>
    /// <response code="500">An unexpected error occurred.</response>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
    {
        try
        {
            var categories = await service.GetCategoriesAsync();
            return Ok(categories);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to get categories");
            return StatusCode(500, new { message = "An unexpected error occurred." });
        }
    }
}
