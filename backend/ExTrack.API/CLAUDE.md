# Backend Context — Expense Tracker

**Framework**: ASP.NET Core 10  
**Database**: SQL Server (LocalDB for dev)  
**ORM**: Entity Framework Core 10.0  
**Testing**: Postman

**For shared context** (database schema, API endpoints, design decisions): See `../../CLAUDE.md` (root)

---

## **1. Quick Start: Backend Setup**

### **Prerequisites**

- .NET 8+ SDK installed (ASP.NET Core 10 requires .NET 8 or later)
- SQL Server LocalDB or Express Edition
- Visual Studio or VS Code (C# extension)

### **Project Creation**

```bash
dotnet new webapi -n ExpenseTracker.API
cd ExpenseTracker.API
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
```

### **Solution Structure**

```
ExpenseTracker.sln
└── ExpenseTracker.API/
    ├── Controllers/
    ├── Models/
    ├── Data/
    ├── Services/
    ├── DTOs/
    ├── Program.cs
    ├── appsettings.json
    └── ExpenseTracker.API.csproj
```

---

## **2. Database Setup (EF Core + SQL Server)**

### **Connection String** (.NET User Secrets — NOT appsettings.json)

**Rule**: Never put connection strings in `appsettings*.json` or any other tracked file. They live in User Secrets (`%APPDATA%\Microsoft\UserSecrets\<UserSecretsId>\secrets.json`, outside the repo), which `WebApplication.CreateBuilder` loads automatically in Development.

```bash
# From the repo root (UserSecretsId is already in ExTrack.API.csproj)
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=...;Database=ExTrackDb;Trusted_Connection=true;TrustServerCertificate=true;" --project backend/ExTrack.API
dotnet user-secrets list --project backend/ExTrack.API
```

Read it as usual: `builder.Configuration.GetConnectionString("DefaultConnection")`.
For deployed environments, use the env var `ConnectionStrings__DefaultConnection` instead.

### **DbContext** (Data/AppDbContext.cs)

```csharp
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Category> Categories { get; set; }
        public DbSet<Expense> Expenses { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Seed Categories
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Food & Dining", Description = "Groceries, restaurants, coffee", Color = "#007BFF" },
                new Category { Id = 2, Name = "Transportation", Description = "Gas, ride-sharing, public transit", Color = "#28A745" },
                new Category { Id = 3, Name = "Utilities", Description = "Electricity, water, internet, phone", Color = "#FFC107" },
                new Category { Id = 4, Name = "Entertainment", Description = "Movies, concerts, subscriptions", Color = "#DC3545" },
                new Category { Id = 5, Name = "Shopping", Description = "Clothes, household items, personal care", Color = "#6F42C1" },
                new Category { Id = 6, Name = "Healthcare", Description = "Doctor visits, prescriptions, gym", Color = "#17A2B8" },
                new Category { Id = 7, Name = "Housing", Description = "Rent, mortgage, home maintenance", Color = "#E83E8C" },
                new Category { Id = 8, Name = "Insurance", Description = "Car, health, home insurance", Color = "#FD7E14" },
                new Category { Id = 9, Name = "Education", Description = "Courses, books, tuition", Color = "#007BFF" },
                new Category { Id = 10, Name = "Subscriptions", Description = "Apps, software, memberships", Color = "#20C997" },
                new Category { Id = 11, Name = "Travel", Description = "Flights, hotels, vacation", Color = "#0DCAF0" },
                new Category { Id = 12, Name = "Work-Related", Description = "Office supplies, professional development", Color = "#6C757D" },
                new Category { Id = 13, Name = "Gifts & Donations", Description = "Gifts for people, charity", Color = "#198754" },
                new Category { Id = 14, Name = "Debt Payments", Description = "Loan payments, credit card payments", Color = "#FF6B6B" },
                new Category { Id = 15, Name = "Miscellaneous", Description = "Catch-all for things that don't fit", Color = "#495057" }
            );
        }
    }
}
```

### **Models** (Models/Category.cs & Models/Expense.cs)

**Category.cs**:

```csharp
namespace ExpenseTracker.API.Models
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string Color { get; set; } = "#007BFF";
        public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    }
}
```

**Expense.cs**:

```csharp
namespace ExpenseTracker.API.Models
{
    public class Expense
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public DateTime Date { get; set; }
        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
```

### **Program.cs** (Dependency Injection & Middleware)

```csharp
var builder = WebApplicationBuilder.CreateBuilder(args);

// Add DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add services
builder.Services.AddScoped<IExpenseService, ExpenseService>();
builder.Services.AddControllers();

// Add CORS (allow frontend to call backend)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Vite dev server
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Apply migrations automatically (development only)
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.Migrate();
    }
}

app.UseRouting();
app.UseCors("AllowFrontend");
app.MapControllers();

app.Run();
```

### **Create Migration**

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

---

## **3. Service Layer Pattern**

### **IExpenseService Interface** (Services/IExpenseService.cs)

```csharp
namespace ExpenseTracker.API.Services
{
    public interface IExpenseService
    {
        Task<IEnumerable<ExpenseDto>> GetExpensesAsync(int? categoryId = null);
        Task<ExpenseDto> GetExpenseByIdAsync(int id);
        Task<ExpenseDto> CreateExpenseAsync(CreateExpenseRequest request);
        Task<ExpenseDto> UpdateExpenseAsync(int id, UpdateExpenseRequest request);
        Task<bool> DeleteExpenseAsync(int id);
        Task<IEnumerable<MonthlySummaryDto>> GetMonthlySummaryAsync(int? categoryId = null);
        Task<IEnumerable<CategorySummaryDto>> GetCategorySummaryAsync(int? categoryId = null);
    }
}
```

### **ExpenseService Implementation** (Services/ExpenseService.cs)

```csharp
namespace ExpenseTracker.API.Services
{
    public class ExpenseService : IExpenseService
    {
        private readonly AppDbContext _context;

        public ExpenseService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ExpenseDto>> GetExpensesAsync(int? categoryId = null)
        {
            var query = _context.Expenses.AsQueryable();

            if (categoryId.HasValue)
            {
                query = query.Where(e => e.CategoryId == categoryId.Value);
            }

            return await query
                .Include(e => e.Category)
                .Select(e => new ExpenseDto
                {
                    Id = e.Id,
                    Amount = e.Amount,
                    Description = e.Description,
                    Date = e.Date,
                    CategoryId = e.CategoryId,
                    CategoryName = e.Category.Name
                })
                .OrderByDescending(e => e.Date)
                .ToListAsync();
        }

        public async Task<ExpenseDto> GetExpenseByIdAsync(int id)
        {
            var expense = await _context.Expenses
                .Include(e => e.Category)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (expense == null)
                throw new KeyNotFoundException($"Expense with ID {id} not found.");

            return new ExpenseDto
            {
                Id = expense.Id,
                Amount = expense.Amount,
                Description = expense.Description,
                Date = expense.Date,
                CategoryId = expense.CategoryId,
                CategoryName = expense.Category.Name
            };
        }

        public async Task<ExpenseDto> CreateExpenseAsync(CreateExpenseRequest request)
        {
            // Validate category exists
            var category = await _context.Categories.FindAsync(request.CategoryId);
            if (category == null)
                throw new ArgumentException($"Category ID {request.CategoryId} not found.");

            var expense = new Expense
            {
                Amount = request.Amount,
                Description = request.Description,
                Date = request.Date,
                CategoryId = request.CategoryId
            };

            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();

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

        public async Task<ExpenseDto> UpdateExpenseAsync(int id, UpdateExpenseRequest request)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null)
                throw new KeyNotFoundException($"Expense with ID {id} not found.");

            var category = await _context.Categories.FindAsync(request.CategoryId);
            if (category == null)
                throw new ArgumentException($"Category ID {request.CategoryId} not found.");

            expense.Amount = request.Amount;
            expense.Description = request.Description;
            expense.Date = request.Date;
            expense.CategoryId = request.CategoryId;

            _context.Expenses.Update(expense);
            await _context.SaveChangesAsync();

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
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null)
                return false;

            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<MonthlySummaryDto>> GetMonthlySummaryAsync(int? categoryId = null)
        {
            var query = _context.Expenses.AsQueryable();

            if (categoryId.HasValue)
            {
                query = query.Where(e => e.CategoryId == categoryId.Value);
            }

            return await query
                .GroupBy(e => new { e.Date.Year, e.Date.Month })
                .Select(g => new MonthlySummaryDto
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Total = g.Sum(e => e.Amount)
                })
                .OrderByDescending(x => x.Year)
                .ThenByDescending(x => x.Month)
                .ToListAsync();
        }

        public async Task<IEnumerable<CategorySummaryDto>> GetCategorySummaryAsync(int? categoryId = null)
        {
            var query = _context.Expenses.AsQueryable();

            if (categoryId.HasValue)
            {
                query = query.Where(e => e.CategoryId == categoryId.Value);
            }

            return await query
                .Include(e => e.Category)
                .GroupBy(e => e.Category.Name)
                .Select(g => new CategorySummaryDto
                {
                    CategoryName = g.Key,
                    Total = g.Sum(e => e.Amount),
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Total)
                .ToListAsync();
        }
    }
}
```

---

## **4. Controller Pattern**

### **ExpensesController** (Controllers/ExpensesController.cs)

```csharp
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTracker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExpensesController : ControllerBase
    {
        private readonly IExpenseService _service;

        public ExpensesController(IExpenseService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ExpenseDto>>> GetExpenses([FromQuery] int? categoryId = null)
        {
            var expenses = await _service.GetExpensesAsync(categoryId);
            return Ok(expenses);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ExpenseDto>> GetExpense(int id)
        {
            try
            {
                var expense = await _service.GetExpenseByIdAsync(id);
                return Ok(expense);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<ExpenseDto>> CreateExpense(CreateExpenseRequest request)
        {
            try
            {
                // Validation
                if (request.Amount <= 0)
                    return BadRequest(new { message = "Amount must be greater than 0." });
                if (request.CategoryId <= 0)
                    return BadRequest(new { message = "Valid category ID is required." });

                var expense = await _service.CreateExpenseAsync(request);
                return CreatedAtAction(nameof(GetExpense), new { id = expense.Id }, expense);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ExpenseDto>> UpdateExpense(int id, UpdateExpenseRequest request)
        {
            try
            {
                // Validation
                if (request.Amount <= 0)
                    return BadRequest(new { message = "Amount must be greater than 0." });
                if (request.CategoryId <= 0)
                    return BadRequest(new { message = "Valid category ID is required." });

                var expense = await _service.UpdateExpenseAsync(id, request);
                return Ok(expense);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteExpense(int id)
        {
            var deleted = await _service.DeleteExpenseAsync(id);
            if (!deleted)
                return NotFound(new { message = $"Expense with ID {id} not found." });

            return NoContent();
        }

        [HttpGet("summary/monthly")]
        public async Task<ActionResult<IEnumerable<MonthlySummaryDto>>> GetMonthlySummary([FromQuery] int? categoryId = null)
        {
            var summary = await _service.GetMonthlySummaryAsync(categoryId);
            return Ok(summary);
        }

        [HttpGet("summary/category")]
        public async Task<ActionResult<IEnumerable<CategorySummaryDto>>> GetCategorySummary([FromQuery] int? categoryId = null)
        {
            var summary = await _service.GetCategorySummaryAsync(categoryId);
            return Ok(summary);
        }
    }
}
```

### **CategoriesController** (Controllers/CategoriesController.cs)

```csharp
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTracker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
        {
            var categories = await _context.Categories
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    Color = c.Color
                })
                .ToListAsync();

            return Ok(categories);
        }
    }
}
```

---

## **5. DTOs** (Create these in /DTOs folder)

All DTO classes needed:

**ExpenseDto.cs**:

```csharp
public class ExpenseDto
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public string? Description { get; set; }
    public DateTime Date { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = null!;
}
```

**CreateExpenseRequest.cs**:

```csharp
public class CreateExpenseRequest
{
    public decimal Amount { get; set; }
    public string? Description { get; set; }
    public DateTime Date { get; set; }
    public int CategoryId { get; set; }
}
```

**UpdateExpenseRequest.cs**:

```csharp
public class UpdateExpenseRequest
{
    public decimal Amount { get; set; }
    public string? Description { get; set; }
    public DateTime Date { get; set; }
    public int CategoryId { get; set; }
}
```

**CategoryDto.cs**:

```csharp
public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Color { get; set; } = null!;
}
```

**MonthlySummaryDto.cs**:

```csharp
public class MonthlySummaryDto
{
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal Total { get; set; }
}
```

**CategorySummaryDto.cs**:

```csharp
public class CategorySummaryDto
{
    public string CategoryName { get; set; } = null!;
    public decimal Total { get; set; }
    public int Count { get; set; }
}
```

---

## **6. Testing with Postman**

### **Setup**

1. Create Postman collection: "Expense Tracker API"
2. Set environment variable: `{{BASE_URL}}` = `http://localhost:5000` (adjust port as needed)

### **Test Cases**

**GET /api/categories**

```
Method: GET
URL: {{BASE_URL}}/api/categories
Expected: 200 OK with array of 15 categories
```

**POST /api/expenses** (Create)

```
Method: POST
URL: {{BASE_URL}}/api/expenses
Body (JSON):
{
  "amount": 45.50,
  "description": "Lunch with team",
  "date": "2026-09-24T12:00:00",
  "categoryId": 1
}
Expected: 201 Created with expense object including Id
```

**GET /api/expenses** (Get All)

```
Method: GET
URL: {{BASE_URL}}/api/expenses
Expected: 200 OK with array of expenses
```

**GET /api/expenses?categoryId=1** (Filter by Category)

```
Method: GET
URL: {{BASE_URL}}/api/expenses?categoryId=1
Expected: 200 OK with filtered expenses
```

**GET /api/expenses/{id}** (Get Single)

```
Method: GET
URL: {{BASE_URL}}/api/expenses/1
Expected: 200 OK with single expense
```

**PUT /api/expenses/{id}** (Update)

```
Method: PUT
URL: {{BASE_URL}}/api/expenses/1
Body (JSON):
{
  "amount": 55.00,
  "description": "Updated lunch",
  "date": "2026-09-24T12:00:00",
  "categoryId": 1
}
Expected: 200 OK with updated expense
```

**DELETE /api/expenses/{id}** (Delete)

```
Method: DELETE
URL: {{BASE_URL}}/api/expenses/1
Expected: 204 No Content
```

**GET /api/expenses/summary/category** (Category Totals)

```
Method: GET
URL: {{BASE_URL}}/api/expenses/summary/category
Expected: 200 OK with array of category summaries
```

**GET /api/expenses/summary/category?categoryId=1** (Category Totals, filtered)

```
Method: GET
URL: {{BASE_URL}}/api/expenses/summary/category?categoryId=1
Expected: 200 OK with a single summary for that category (empty if it has no expenses)
```

**GET /api/expenses/summary/monthly** (Monthly Totals)

```
Method: GET
URL: {{BASE_URL}}/api/expenses/summary/monthly
Expected: 200 OK with array of monthly summaries
```

**GET /api/expenses/summary/monthly?categoryId=1** (Monthly Totals, filtered)

```
Method: GET
URL: {{BASE_URL}}/api/expenses/summary/monthly?categoryId=1
Expected: 200 OK with monthly summaries for that category only
```

---

## **7. Error Handling Patterns**

**Always follow this pattern in controllers**:

```csharp
try
{
    // Validate input
    if (invalid)
        return BadRequest(new { message = "Error description" });

    // Call service
    var result = await _service.DoSomethingAsync();

    // Return appropriate status
    return Ok(result); // or CreatedAtAction, NoContent, etc.
}
catch (KeyNotFoundException ex)
{
    return NotFound(new { message = ex.Message });
}
catch (ArgumentException ex)
{
    return BadRequest(new { message = ex.Message });
}
catch (Exception ex)
{
    return StatusCode(500, new { message = "An unexpected error occurred." });
}
```

---

## **8. Validation Rules**

Enforce these rules in controller **AND** service:

- **Amount**: Must be > 0 (decimal with 2 decimal places)
- **CategoryId**: Must exist in Categories table
- **Date**: Must be a valid datetime (can be past or present)
- **Description**: Optional (null/empty allowed)
- **Category Name**: Unique, non-empty

---

## **9. Common Patterns**

### **Async/Await**

- All DB operations should be async (Task/Task<T>)
- Always use `await` — never `.Result` or `.Wait()`

### **LINQ Queries**

```csharp
// Filter
var food = _context.Expenses.Where(e => e.CategoryId == 1);

// Include related data
var withCategory = _context.Expenses.Include(e => e.Category);

// Group & aggregate
var byCategory = _context.Expenses
    .GroupBy(e => e.CategoryId)
    .Select(g => new { CategoryId = g.Key, Total = g.Sum(e => e.Amount) });

// Order
var recent = _context.Expenses.OrderByDescending(e => e.Date);
```

### **DateTime Handling**

- Use `DateTime.UtcNow` for server time (not `DateTime.Now`)
- Store dates as UTC in database
- Frontend converts to local timezone

---

## **10. Running the API**

```bash
# From /backend/ExpenseTracker.API directory

# Restore dependencies
dotnet restore

# Build
dotnet build

# Run
dotnet run

# With hot reload
dotnet watch run
```

API runs on `http://localhost:5000` (or `https://localhost:5001`)

Check `/swagger` endpoint if you added Swagger (optional, but helpful for testing).

---

## **Ready to Code?**

1. Run `dotnet new webapi -n ExpenseTracker.API`
2. Add DbContext and Models (see sections 2-3)
3. Create migrations: `dotnet ef migrations add InitialCreate`
4. Build controllers (section 4)
5. Test with Postman (section 6)
