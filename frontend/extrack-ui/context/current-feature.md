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

- **2026-10-07 — Foundation (API Plumbing and Theme)**: Added a Vite proxy (`/api` → `http://localhost:5071`) for both `dev` and `preview`, `services/api.js` with all expense, category and summary calls (`fetchJSON` returns `null` on 204 and falls back to `HTTP <status>` for error bodies that aren't JSON, also reading ProblemDetails `title`), and `styles/App.css` with the theme tokens plus dark mode via `prefers-color-scheme`. Verified `getCategories()` returns 15 categories through the proxy. Updated frontend `CLAUDE.md` § 5 `BASE_URL` to `'/api'`. Deferred: content-type check for 200 responses that aren't JSON, color contrast (muted text ~3.1:1, white on primary ~4.4:1) and syncing the § 5 `fetchJSON` example (task 11).
- **2026-10-07 — App Shell (Header, Layout and View Switching)**: `App.jsx` now holds `currentView` (default `'dashboard'`) and renders one view, with an `<aside className="sidebar">` placeholder. Added `Header.jsx` (logo plus Dashboard/Expenses nav from a `VIEWS` list; active button highlighted with `aria-current="page"` and a focus ring) and placeholder `Dashboard.jsx` / `ExpensesList.jsx` (heading only). `App.css` gained the header, sidebar (220px) and main-content layout, stacking at ≤900px. Checked in the browser, including dark mode. Deferred: sidebar heading order (`h2` before the view's `h1`) and showing categories as wrapping chips on narrow screens (task 03); syncing the § 3 `App.jsx` and § 6 CSS examples (task 11).
- **2026-10-07 — Category Filter (Sidebar)**: Added `Sidebar.jsx`, which fetches categories inside `useEffect` (with an `ignore` flag for responses after unmount) and shows "All Expenses" plus one button per category, with loading and error states. The active button is highlighted (same style as the nav) and marked with `aria-pressed`. `App.jsx` holds `selectedCategory` (`null` = all), so the filter survives view switches. "Categories" is now a plain label, not a heading, and at ≤900px the list becomes wrapping chips (both deferred from task 02). Deferred: a sticky sidebar for long pages (task 04), a friendlier error message with Retry (task 11) and syncing the § 4 `Sidebar.jsx` example (task 11).
- **2026-10-07 — Expenses List (Read-Only)**: Added `ExpensesList.jsx`, which fetches `getExpenses(selectedCategory)` inside `useEffect` (re-fetching on `selectedCategory` / `refreshTrigger`, ignoring stale responses), with loading, empty and error states. Added `ExpenseTable.jsx` / `ExpenseRow.jsx` (date, category, description, amount; no Actions column yet), shared `utils/format.js` (`formatCurrency` in USD with 2 decimals, `formatDate` in the user's locale), and `ExpensesList.css` using theme tokens (sideways-scrolling table, right-aligned tabular amounts, subtle category badge). `App.jsx` gained `refreshTrigger` state (setter comes in task 05). The sidebar's category list is now sticky on desktop, capped to the window height with its own scrollbar (fix from review: on short windows the bottom categories were unreachable). Deferred: keeping old rows visible while a new filter loads instead of blinking (task 11) and syncing the § 4/§ 6 examples (task 11).
