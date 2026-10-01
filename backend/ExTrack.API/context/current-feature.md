# Current Feature: Add API Endpoints

Build the ExTrack.API REST endpoints one at a time. Each cycle covers the DTO, service interface, service implementation, controller and DI registration, then stops for review.

## Status

In Progress

## Goals

- Cycle 1: `GET /api/expenses` with an optional `?categoryId=` filter (`ExpenseDto`, `IExpenseService`, `ExpenseService`, `ExpensesController`, DI registration)
- Cycle 2: `GET /api/expenses/{id}` (404 when not found)
- Cycle 3: `POST /api/expenses` (`CreateExpenseRequest`, returns 201 via `CreatedAtAction`)
- Cycle 4: `PUT /api/expenses/{id}` (`UpdateExpenseRequest`, 404 / 400 handling)
- Cycle 5: `DELETE /api/expenses/{id}` (204, or 404 when not found)
- Cycle 6: `GET /api/categories` (`CategoryDto`, `ICategoryService`, `CategoryService`, `CategoriesController`, DI registration)
- Cycle 7: `GET /api/expenses/summary/monthly` (`MonthlySummaryDto`)
- Cycle 8: `GET /api/expenses/summary/category` (`CategorySummaryDto`)
- Each cycle: `dotnet build` passes, then stop for review with the files changed and a sample request to test
- After all cycles are approved: check `dotnet ef migrations has-pending-model-changes`; add a migration only if there are changes, then `dotnet ef database update`

## Notes

- Spec: `context/features/261001_add-api-endpoints.md`; reference code in backend `CLAUDE.md` sections 3–5, 7 and 8; endpoint list in root `claude.md` section 4
- Don't start the next cycle until the current one is approved
- Filtered and unfiltered `GET /api/expenses` are one action with a nullable `categoryId` query parameter
- `CategoriesController` uses `ICategoryService`, not `AppDbContext` directly
- Match the existing style: file-scoped `ExTrack.API.*` namespaces, primary constructors, async/await
- Validate in the controller AND the service: Amount > 0, CategoryId must exist; errors return `{ message }` with 400 / 404 / 500 (backend `CLAUDE.md` section 7)
- Map entities to DTOs in LINQ `Select`; never return EF entities
- XML doc comments on controller actions for Swagger
- Out of scope: API versioning, AutoMapper, global exception middleware, pagination, auth, unit tests
- Connection string stays in User Secrets only
- Don't commit without asking first

## History

<!-- Keep this updated. Earliest to latest -->

- **2026-09-30 — EF Core Setup**: Added EF Core SqlServer/Tools packages, `Category` and `Expense` models, `AppDbContext` with Fluent API constraints and 15 seeded categories, DbContext registration from User Secrets, `AllowFrontend` CORS policy, dev auto-migrate, and the `InitialCreate` migration.
