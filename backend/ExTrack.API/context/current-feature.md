# Current Feature: EF Core Setup

Set up Entity Framework Core in ExTrack.API with SQL Server, models, DbContext, DI, and the initial migration.

## Status

In Progress

## Goals

- Install EF Core NuGet packages (`Microsoft.EntityFrameworkCore.SqlServer`, `Microsoft.EntityFrameworkCore.Tools`)
- Add `Category` and `Expense` models in `Models/`
- Create `AppDbContext` in `Data/` with `Categories` and `Expenses` DbSets and the 15 seed categories
- Register the DbContext in `Program.cs` using the `DefaultConnection` connection string from User Secrets
- Add DI and middleware setup (CORS for `http://localhost:5173`, auto-migrate in Development)
- Create the `InitialCreate` migration and apply it to the database

## Notes

- Spec: `context/features/260930_ef-core-setup.md`; reference implementation in `CLAUDE.md` (backend) sections 2 and 3
- Connection string is already set in User Secrets. Never put it in `appsettings*.json` or any tracked file
- Money uses `DECIMAL(10,2)`, never float
- `Expense.Description` is optional; `Category.Name` is unique; `Category.Color` defaults to `#007BFF`
- Use `DateTime.UtcNow` for `CreatedAt`
- `IExpenseService` registration is out of scope here unless the service layer exists

## History

<!-- Keep this updated. Earliest to latest -->
