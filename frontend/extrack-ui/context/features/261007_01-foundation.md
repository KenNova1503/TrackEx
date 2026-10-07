# Foundation: API Plumbing and Theme

## Overview
Set up the pieces every later task depends on: a dev proxy to the backend, the API service layer and the global theme. No visible UI yet.

## Requirements
Refer to the frontend `CLAUDE.md` § 5 (API service layer) and § 6 (CSS), and the root `CLAUDE.md` § 6 (theme).
- Add a Vite dev proxy in `vite.config.js`: `/api` → `http://localhost:5071` (the backend's port in `launchSettings.json`).
- Create `src/services/api.js` with `BASE_URL = '/api'` and every function from § 5.
- `fetchJSON` must return `null` for `204 No Content` (DELETE) instead of calling `response.json()`, and must handle error bodies that aren't JSON.
- Create `src/styles/App.css` with the theme tokens from the root § 6, plus dark-mode overrides under `@media (prefers-color-scheme: dark)`, and import it in `main.jsx`.
- Verify with a temporary `console.log(await getCategories())` in `App.jsx` (15 categories), then remove it.

## Notes
- Update the frontend `CLAUDE.md` § 5 so its `BASE_URL` matches (`'/api'`, not `http://localhost:5000/api`).
- The backend must be running (`dotnet run` in `backend/ExTrack.API`).
- Out of scope: any components.
