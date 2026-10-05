# EF Core 10: New Features and Breaking Changes from EF Core 9

These notes were researched on 2026-10-05 with the Context7 MCP server, for the ExTrack backend (.NET 10, EF Core 10.0.12, SQL Server LocalDB).

**Summary:** none of EF Core 10's breaking changes affect the current code, and none of the new features require changes. The project already runs EF Core 10, so this is mainly a checklist for future work.

---

## Release facts

- EF Core 10 is a **long-term support (LTS)** release. It shipped in **November 2025** and is supported until **November 10, 2028**.
- It requires the **.NET 10** SDK and runtime.

---

## New features

### Relevant to this project

| Feature | What it means here |
|---|---|
| **Migrations aren't all wrapped in one transaction** | Reverses an EF Core 9 change. It affects how `Database.Migrate()` applies migrations on startup. |
| **Simpler SQL parameter names** | Logged SQL shows `@categoryId` instead of `@__categoryId_0`. |
| **Inlined values hidden in logs** | Inlined constants appear as `?` in logged SQL unless `EnableSensitiveDataLogging` is on. |
| **Raw SQL analyzer** | Warns when a `FromSqlRaw` query is built by joining strings together, the classic SQL-injection risk. |
| **`LeftJoin` / `RightJoin`** | .NET 10's new LINQ join operators are translated to SQL. Query syntax can't express them yet. |
| **Query fixes** | Improvements to `Count` on `ICollection<T>`, `MIN`/`MAX` over `DISTINCT`, and `DefaultIfEmpty`. |
| **Named default constraints** | `.HasDefaultValueSql("GETDATE()", "DF_Expenses_CreatedAt")`. Only matters if `CreatedAt` gets a database default; today it's set in C#. `modelBuilder.UseNamedDefaultConstraints()` names all defaults, but the next migration then renames every existing default constraint. |

### Not relevant to this project (yet)

**SQL Server / Azure SQL**
- `vector` columns and `EF.Functions.VectorDistance(...)` for similarity search, through `SqlVector<float>`. Needs SQL Server 2025 or Azure SQL.
- A native `json` column type. It's the default only with `UseAzureSql` or compatibility level 170 or higher.

**Complex types**
- They can be optional (`Address? BillingAddress`), as long as the type has at least one required property.
- They can be stored as JSON: `ComplexProperty(c => c.Details, b => b.ToJson())`.
- Structs can be complex types, but collections of structs aren't supported yet.
- Microsoft now recommends complex types over owned types for table splitting and JSON.

**LINQ and SQL translation**
- `Contains` on a list (`ids.Contains(x)`) becomes `IN (@ids1, @ids2, ...)` with padding. You can control this per query with `EF.Constant`, `EF.Parameter` or `EF.MultipleParameters`, or globally with `UseParameterizedCollectionMode`.
- Split queries now order consistently.
- New translations: `DateOnly.ToDateTime()`, `DateOnly.DayNumber`, and microsecond/nanosecond `DatePart`. `COALESCE` becomes `ISNULL` on SQL Server.

**Bulk updates and filters**
- `ExecuteUpdateAsync` takes a normal lambda, so setters can be added conditionally:
  ```csharp
  await context.Expenses.ExecuteUpdateAsync(s =>
  {
      s.SetProperty(e => e.Amount, newAmount);
      if (updateDescription)
          s.SetProperty(e => e.Description, newDescription);
  });
  ```
- `ExecuteUpdateAsync` works on JSON columns (complex types only, not owned types).
- Named query filters let you switch off one filter without disabling the rest:
  ```csharp
  modelBuilder.Entity<Blog>().HasQueryFilter("SoftDelete", b => !b.IsDeleted);
  context.Blogs.IgnoreQueryFilters(["SoftDelete"]);
  ```

**Other**
- SQLite: AUTOINCREMENT can be turned off.
- Lazy-loading performance improvements and Azure Data Explorer scaffolding.
- Cosmos DB: full-text search, hybrid search with `Rrf`, vector search out of preview (`IsVectorProperty`, `IsVectorIndex`), default values for newly required properties, and an execution strategy for queries.

---

## Breaking changes from EF Core 9

| Change | Impact | What changed | Fix | Affects this project? |
|---|---|---|---|---|
| EF adds `Application Name` to the connection string | Low | If the connection string has no `Application Name`, EF adds one with version info. Mixing EF with Dapper or ADO.NET can then use separate connection pools and escalate a `TransactionScope` to a distributed transaction. | Set `Application Name` yourself. | **Silently, yes.** The connection string in User Secrets has none. Harmless unless non-EF data access is added. |
| `Contains` on a list uses multiple parameters | Low | Becomes `IN (@p1, @p2, ...)` instead of OPENJSON. | If performance drops, use `UseParameterizedCollectionMode(...)` or `EF.Parameter(ids)`. | Not today. A future "filter by several categories" query would use the new SQL. |
| SQL parameter names simplified | Low | `@__city_0` becomes `@city`. Query plans recompile once. | Update anything that parses SQL text or parameter names. | Only if you match on log text. |
| EF tools need `--framework` for multi-targeted projects | **Medium** | Projects with `<TargetFrameworks>` must pass `--framework netX.0`. | Pass `--framework`. | No. The project targets only `net10.0`. |
| `json` column type is the default on Azure SQL or compatibility level 170 | Low | JSON columns become `json`, and a migration alters existing ones. | `UseCompatibilityLevel(160)` or `HasColumnType("nvarchar(max)")`. | No. `UseSqlServer` defaults to level 150 and there are no JSON columns. |
| `ExecuteUpdateAsync` takes `Func<>`, not `Expression<>` | Low | Code that built setter expression trees no longer compiles. | Use a block lambda. | No. Not used. |
| Complex type column names made unique | Low | Shared column names get a numeric suffix. | `HasColumnName`. | No. No complex types. |
| Nested complex type columns use the full path | Low | `NestedComplex_Prop` becomes `Complex_NestedComplex_Prop`. | `HasColumnName`. | No. No complex types. |
| `IDiscriminatorPropertySetConvention` signature | Low | Now takes `IConventionTypeBaseBuilder`. | Update custom conventions. | No. |
| `IRelationalCommandDiagnosticsLogger` adds `logCommandText` | Low | New parameter. | Update custom logger implementations. | No. |
| Microsoft.Data.Sqlite treats `DateTime` / `DateTimeOffset` as UTC (3 changes) | **High** | Values without an offset are read as UTC, REAL columns are written in UTC, and `GetDateTime` with an offset returns UTC. | Temporary opt-out: AppContext switch `Microsoft.Data.Sqlite.Pre10TimeZoneHandling`. | No. SQLite only. |

**Checked against the current code:** the `GroupBy` / `Sum` / `Count` summaries, `FindAsync`, `HasData` seeding, `Database.Migrate()` on startup and the Restrict foreign key aren't affected by any of these changes.

---

## Sources

- **Context7 MCP:** library `/dotnet/entityframework.docs` (`ef-core-10.0/whatsnew.md` and `ef-core-10.0/breaking-changes.md`). It only returned fragments, so the full Microsoft pages below were used to fill the gaps.
- **Microsoft Learn:**
  - [What's New in EF Core 10](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-10.0/whatsnew) (updated 2026-08-05)
  - [Breaking changes in EF Core 10](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-10.0/breaking-changes) (updated 2026-07-01)
