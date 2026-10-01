using ExTrack.API.DTOs;

namespace ExTrack.API.Services;

public interface ICategoryService
{
    Task<IEnumerable<CategoryDto>> GetCategoriesAsync();
}
