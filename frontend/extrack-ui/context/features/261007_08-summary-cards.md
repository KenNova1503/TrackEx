# Dashboard Summary Cards

## Overview
Replace the Dashboard placeholder with the row of 4 summary cards.

## Requirements
Refer to the root `CLAUDE.md` § 6 (dashboard layout, theme) and the frontend `CLAUDE.md` § 4 (`Dashboard.jsx`, `SummaryCard.jsx`).
- `SummaryCard.jsx` with label, value and an optional subtitle.
- Cards: Total spent this month, Number of expenses, Top category, vs last month.
- All cards respect the selected category (`getMonthlySummary(categoryId)`, `getCategorySummary(categoryId)`, `getExpenses(categoryId)`).
- "Total spent this month" and "vs last month" come from `/summary/monthly`, looking months up by year and month (the endpoint skips months with no expenses).
- Loading and empty states.

## Notes
- Make the subtitle of "Total spent this month" match its period (this month's count, not the all-time count).
- Add `categoryId` to `getCategorySummary` in `api.js` (the backend supports it).
- Out of scope: chart and recent expenses (tasks 09 and 10).
