# ExTrack — Expense Tracker

A personal expense tracker built as a **portfolio project**. Its main purpose is to show how I build software **with AI assistance**: Anthropic Claude (Claude Code) and GitHub Copilot, guided by a structured, reviewed workflow.

The app itself is deliberately simple. You can add, edit, delete and filter expenses, and see totals by month and by category.

---

## What this project is (and isn't)

**This project shows:**

- **AI-assisted development**: using Claude Code and GitHub Copilot as development partners, not just autocomplete
- **An AI workflow**: project context files, reusable skills and a spec → build → review → merge loop, with me reviewing every step
- **.NET 10 / ASP.NET Core**: a REST API with controllers, a service layer, DTOs and dependency injection
- **Entity Framework Core + Microsoft SQL Server**: code-first models, Fluent API configuration, seed data and migrations
- **Plain React (JSX)**: function components with React's built-in hooks (`useState`, `useEffect`) and the Fetch API, with no Redux or other state-management libraries and no UI component libraries *(in progress)*

**This project does not try to show:**

- Expertise in other technologies, frameworks or libraries
- Advanced design patterns or enterprise architecture (no CQRS, repository layer, AutoMapper, MediatR and so on)
- Production concerns such as authentication, multi-user support or deployment

That's on purpose. The scope is kept small so the focus stays on **how the work is done**: planning with an AI, reviewing what it produces, and keeping control of the codebase.

---

## How I work with AI on this project

### Context files
The AI works from written context instead of guessing:

| File | Purpose |
|------|---------|
| `claude.md` (root) | Project scope, database schema, API contract, UI layout, design decisions |
| `backend/ExTrack.API/claude.md` | Backend conventions and reference code |
| `frontend/claude.md` | Frontend conventions |
| `context/coding-rules.md` | C# / .NET coding standards |
| `context/ai-interaction.md` | Rules for the AI: ask before committing, no scope creep, minimal changes, stop when stuck |
| `context/current-feature.md` | The feature in progress, plus a history of completed features |

### Custom Claude Code skills
- **`/feature`** manages a feature from start to finish: `load` a spec → `start` (creates the branch) → `review` → `explain` → `complete` (commit, merge into `develop`, reset)
- **`/cleanup`** handles housekeeping: unused imports, stale TODOs, orphaned files, and context files that have drifted from the code

### MCP servers
Claude Code connects to **[Context7](https://context7.com)** through MCP (Model Context Protocol), so it can look up current library documentation instead of relying on what the model remembers from training. For example, [EF Core 10: New Features and Breaking Changes](backend/ExTrack.API/context/tech-updates/EFCore_10_mcp.md) was researched with Context7 and checked against Microsoft's official docs. Each change is marked with whether it affects this project.

The server is configured in `backend/ExTrack.API/.mcp.json`. The API key isn't in the file; it reads from a `CONTEXT7_API_KEY` environment variable.

### Reviewed in small steps
Features are written as short specs in `context/features/`. Larger features are built in **cycles** that I review one at a time. For example, the REST API was built one endpoint per cycle (DTO → service → controller → DI), and the AI stopped after each cycle for my approval before continuing. Design questions raised during review, such as where validation belongs or whether an ID goes in the route or the body, were settled in conversation before the code moved on.

### GitHub Copilot
Copilot is my day-to-day companion when I write or adjust code myself in **Visual Studio**:

- **Inline completions**: suggestions as I type, which I accept, edit or reject
- **Copilot Chat**: asking questions and getting explanations of code, including code Claude Code generated, so I understand it before approving it
- **Commit and PR messages**: drafting commit messages and pull request descriptions, which I review before using

Claude Code handles the planned, reviewed feature work described above. Copilot covers the moments in between: small edits, quick questions and reviewing what was built.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Backend | .NET 10, ASP.NET Core Web API |
| Data | Entity Framework Core 10, Microsoft SQL Server (LocalDB for development) |
| API docs | OpenAPI + Swagger UI |
| Frontend | React 19 (JSX), Vite, plain CSS *(in progress)* |
| AI tooling | Claude Code (Anthropic), GitHub Copilot, Context7 (MCP) |

---

## Project status

| Area | Status |
|------|--------|
| Database (EF Core, migrations, seed data) | ✅ Done |
| REST API (expenses, categories, summaries) | ✅ Done |
| React frontend | 🚧 In progress |

---

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses?categoryId=` | List expenses, optionally filtered by category |
| GET | `/api/expenses/{id}` | Get one expense |
| POST | `/api/expenses` | Create an expense |
| PUT | `/api/expenses/{id}` | Update an expense |
| DELETE | `/api/expenses/{id}` | Delete an expense |
| GET | `/api/categories` | List categories |
| GET | `/api/expenses/summary/monthly?categoryId=` | Monthly totals |
| GET | `/api/expenses/summary/category?categoryId=` | Totals by category |

---

## Running the backend locally

**Prerequisites:** .NET 10 SDK, SQL Server or LocalDB, and the EF Core CLI (`dotnet tool install --global dotnet-ef`)

```bash
cd backend/ExTrack.API

# Store the connection string in User Secrets (it is never committed)
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=(localdb)\\MSSQLLocalDB;Database=ExTrackDb;Trusted_Connection=true;TrustServerCertificate=true;"

dotnet run
```

In Development, pending migrations are applied automatically when the app starts. Open `/swagger` on the URL shown in the console to try the API.

---

## Project structure

```
ExTrack/
├── claude.md                 # Root AI context (scope, schema, API contract)
├── backend/
│   ├── ExTrack.slnx
│   └── ExTrack.API/
│       ├── .claude/skills/   # Custom Claude Code skills (/feature, /cleanup)
│       ├── .mcp.json         # MCP server config (Context7)
│       ├── context/          # AI rules, current feature, feature specs, tech updates
│       ├── Controllers/
│       ├── Services/
│       ├── DTOs/
│       ├── Models/
│       └── Data/             # DbContext + migrations
└── frontend/                 # React app (in progress)
```

---

## License

[MIT](LICENSE)
