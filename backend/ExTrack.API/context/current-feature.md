# Current Feature

<!-- Feature name and short description -->

## Status

<!-- Not Started | In Progress | Completed -->

## Goals

<!-- Goals and requirements -->

## Notes

<!-- Any extra notes -->

## History

<!-- Keep this updated. Earliest to latest -->

- **2026-09-30 — EF Core Setup**: Added EF Core SqlServer/Tools packages, `Category` and `Expense` models, `AppDbContext` with Fluent API constraints and 15 seeded categories, DbContext registration from User Secrets, `AllowFrontend` CORS policy, dev auto-migrate, and the `InitialCreate` migration.
- **2026-10-02 — Add API Endpoints**: Built all 8 endpoints in reviewed cycles: expense CRUD (`GET` with optional `categoryId`, `GET {id}`, `POST`, `PUT`, `DELETE`), `GET /api/categories`, and monthly/category summaries (both with optional `categoryId`). Added `IExpenseService`/`ExpenseService`, `ICategoryService`/`CategoryService`, six DTOs, controller + service validation with `{ message }` errors, `Expense` limit constants, and XML docs for Swagger. No migration needed (no model changes). Deferred to cleanup: shared DTO mapping, shared create/update validation, syncing backend `claude.md` reference code.
- **2026-10-10 — Seed Demo Data**: Added `Data/DemoDataSeeder.cs`, a synchronous `Seed(DbContext)` registered with `UseSeeding` in `Program.cs` and gated by the `SeedDemoData` flag (default `false`; command-line arg, User Secrets or env var). Seeds 171 expenses over the current month and the two before it, across 12 categories (Housing, Travel, Debt Payments empty): Education and Miscellaneous have the highest totals, Food & Dining the most entries, and fixed bills repeat monthly. Dates are relative to `DateTime.UtcNow`; the current month is squeezed into the days so far. Skips seeding if any expenses exist. Startup keeps sync `Migrate()`. Verified seeding, no duplicates on rerun, and no seeding without the flag. No migration needed.
