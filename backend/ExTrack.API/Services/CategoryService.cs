using ExTrack.API.Data;
using ExTrack.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace ExTrack.API.Services;

public class CategoryService(AppDbContext context) : ICategoryService
{
    public async Task<IEnumerable<CategoryDto>> GetCategoriesAsync()
    {
        // Order by Id so the list matches the seed order (Miscellaneous last)
        return await context.Categories
            .OrderBy(c => c.Id)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                Color = c.Color
            })
            .ToListAsync();
    }
}
