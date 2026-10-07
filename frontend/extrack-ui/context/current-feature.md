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
