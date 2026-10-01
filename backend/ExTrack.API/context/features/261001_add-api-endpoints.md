# Add API Endpoints

## Overview
This document outlines the steps to build the ExTrack.API REST endpoints. Each endpoint is built in its own **cycle**: DTO → service interface → service implementation → controller → dependency injection. After each cycle, stop and wait for my review before starting the next one.

## Requirements
Refer to section 4 of the root `~/claude.md` for the endpoint list, and to the backend `CLAUDE.md` (sections 3–5, 7 and 8) for the reference DTOs, service, controller, error-handling and validation code.

### Cycle (repeat for each endpoint)
1. **DTO**: Create the DTO(s) the endpoint needs in `DTOs/`. Skip this step if they already exist or the endpoint doesn't need one.
2. **Service interface**: Add the method signature to the interface in `Services/`. Create the interface if it doesn't exist yet.
3. **Service implementation**: Implement the method in the service class in `Services/`. Create the class if it doesn't exist yet.
4. **Controller**: Add the action to the controller in `Controllers/`. Create the controller if it doesn't exist yet.
5. **Dependency injection**: Register the service in `Program.cs` with `AddScoped`. Skip this step if it's already registered.
6. **Build**: Run `dotnet build` and fix any errors or warnings.
7. **Stop for review**: List the files changed and include a sample request to test the endpoint (in the format of backend `CLAUDE.md` section 6). Don't start the next cycle until I approve.

### Endpoint order (one cycle each)
| # | Endpoint | Service | Controller |
|---|----------|---------|------------|
| 1 | `GET /api/expenses` (with optional `?categoryId=`) | `IExpenseService` / `ExpenseService` | `ExpensesController` |
| 2 | `GET /api/expenses/{id}` | `IExpenseService` / `ExpenseService` | `ExpensesController` |
| 3 | `POST /api/expenses` | `IExpenseService` / `ExpenseService` | `ExpensesController` |
| 4 | `PUT /api/expenses/{id}` | `IExpenseService` / `ExpenseService` | `ExpensesController` |
| 5 | `DELETE /api/expenses/{id}` | `IExpenseService` / `ExpenseService` | `ExpensesController` |
| 6 | `GET /api/categories` | `ICategoryService` / `CategoryService` | `CategoriesController` |
| 7 | `GET /api/expenses/summary/monthly` | `IExpenseService` / `ExpenseService` | `ExpensesController` |
| 8 | `GET /api/expenses/summary/category` | `IExpenseService` / `ExpenseService` | `ExpensesController` |

### After all endpoints are approved
- Check for model changes with `dotnet ef migrations has-pending-model-changes`.
- If there are changes, create a migration (`dotnet ef migrations add <Name>`) and apply it with `dotnet ef database update`.
- If there are none, don't create an empty migration. Run `dotnet ef database update` to confirm the database is up to date, and tell me.

## Notes
- The filtered `GET /api/expenses?categoryId=2` is the same action as `GET /api/expenses`, with a nullable query parameter, so they share cycle 1.
- `CategoriesController` gets its own `ICategoryService` / `CategoryService`, instead of using `AppDbContext` directly as the backend `CLAUDE.md` example does.
- Match the existing code style: file-scoped namespaces (`ExTrack.API.*`), primary constructors and async/await everywhere.
- Validate in both the controller and the service: Amount > 0, and CategoryId must exist. Error responses follow the backend `CLAUDE.md` section 7 pattern (`{ message = "..." }` with 400 / 404 / 500).
- Map entities to DTOs by hand inside LINQ `Select`, so the API never returns EF entities.
- Add XML doc comments to controller actions for Swagger.
- Out of scope: API versioning, AutoMapper, global exception middleware, pagination, authentication and unit tests.
- Never put the connection string in `appsettings*.json` or any other tracked file.
- Don't commit without asking me first.
