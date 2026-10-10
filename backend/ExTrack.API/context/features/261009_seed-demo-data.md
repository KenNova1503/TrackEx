# Seed Demo Data

## Overview
This document outlines the steps to seed believable demo expenses into the database with EF Core 10's `UseSeeding` hook. The data gives the Dashboard something to show: several categories in the bar chart, recent expenses, and a meaningful "vs last month" card. Seeding only runs on startup when it's explicitly asked for.

## Requirements

### Seed data
- Seed **three months**: the current month, last month and the month before. Run in October 2026, that's **August, September and October**.
- Spread expenses across **12 categories**. **Miscellaneous**, **Education** and **Food & Dining** must be included. The other 9 can be picked from the remaining 12 seeded categories (e.g. Housing, Utilities, Transportation, Subscriptions, Entertainment, Healthcare, Shopping, Insurance, Travel, Work-Related, Gifts & Donations, Debt Payments). Leave the last 3 categories empty, so the sidebar filter also shows an empty state.
- Give each seeded category about **3–15 expenses per month**, depending on how often it realistically comes up. For example, rent is 1 payment but its category could hold 3 entries with maintenance costs, while Food & Dining has many small purchases.
- **Make spending uneven across categories**, the way it is in real life. Category totals shouldn't sit close together; the bar chart should show clear differences between big and small categories:
  - **Food & Dining** has the **most entries** (near the top of the 3–15 range), each fairly small.
  - **Miscellaneous** and **Education** have the **highest totals** among the seeded categories (for example a course fee, textbooks, or a one-off larger purchase).
  - At least one or two categories stay small (a few entries with low amounts).
- Keep amounts and descriptions realistic, for example "Monthly rent" at 1,200.00, "Electric bill" at 84.37 and "Coffee with Sam" at 4.75. Some descriptions can be `null`, since the field is optional.
- Make this month's and last month's totals differ by roughly 5–20%, so "vs last month" shows a clear ▲ or ▼ instead of ~0%. The current month is partial, so its entries only cover the days up to today.
- Calculate dates **relative to `DateTime.UtcNow`**, not hard-coded, so the demo still shows the last three months whenever it's run. Dates in the current month must not be later than today.

### Seeding method
1. **Seeder class**: Create `Data/DemoDataSeeder.cs` with a single synchronous `Seed(DbContext)` method that builds the expense list and saves it.
2. **Idempotent**: Skip seeding if the `Expenses` table already has rows, so restarts don't create duplicates or overwrite real data.
3. **Hook**: In `Program.cs`, register the seeder on the `AddDbContext` options with `UseSeeding` only. Don't add `UseAsyncSeeding`.
4. **Opt-in flag**: Gate the hook behind a configuration value, `SeedDemoData` (bool, default `false`). Seeding only runs when it's set, for example:
   - `dotnet run -- --SeedDemoData=true` (command-line argument)
   - `dotnet user-secrets set "SeedDemoData" "true"`, or the `SeedDemoData` env var
   Don't set it to `true` in any tracked `appsettings*.json` file.
5. **Startup**: Keep the existing dev auto-migrate in `Program.cs` as `db.Database.Migrate()`. The sync call is what triggers `UseSeeding`, so don't switch it to `MigrateAsync()`.
6. **Build**: Run `dotnet build` and fix any errors or warnings.
7. **Verify**: Run with the flag on, then check `GET /api/expenses`, `GET /api/expenses/summary/monthly` and `GET /api/expenses/summary/category`. Run again to confirm nothing is duplicated, then run without the flag to confirm nothing is seeded.
8. **Stop for review**: List the files changed and the seeded totals per month and per category.

## Notes
- **Don't use `HasData` for expenses.** `HasData` is for fixed reference data like categories, and it would bake fixed dates into a migration. `UseSeeding` runs at runtime, so dates can be relative and no migration is needed.
- **Sync only, on purpose.** EF calls `UseSeeding` from `Migrate()`, `EnsureCreated()` and `dotnet ef database update`, and `UseAsyncSeeding` only from `MigrateAsync()` / `EnsureCreatedAsync()`. With the sync `Migrate()` on startup, one sync method covers both startup and the EF tooling. EF recommends implementing both hooks, but that's more than a demo seeder needs. Blocking briefly during a one-time startup step is fine. The "async everywhere" rule applies to request handling.
- Don't make one method wrap the other. That would need `.Result` / `.Wait()`, which the coding rules forbid.
- `UseSeeding` runs whenever `Migrate()` is called, even with no pending migrations. That's why the flag and the "table already has rows" check are needed.
- Seeding happens in Development only, because migrations only run on startup there. `dotnet ef database update` also seeds if the flag is set in User Secrets or an env var.
- Use `context.Set<Expense>()` inside the hook, since it receives a plain `DbContext`.
- Seed through the `Expense` entity with `CategoryId` set to the seeded category IDs (1–15). Don't create new categories.
- Amounts must use `decimal` literals (`84.37m`), never `double`.
- To reset the demo, delete the expenses (or drop the database with `dotnet ef database drop`) and run again with the flag.
- Match the existing code style: file-scoped namespaces (`ExTrack.API.*`).
- Out of scope: a reset/re-seed endpoint, random data generation (e.g. Bogus), seeding more than three months, and frontend changes.
- No migration is expected. Confirm with `dotnet ef migrations has-pending-model-changes`.
- Don't commit without asking me first.
