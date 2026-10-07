# Recent Expenses

## Overview
Add the read-only "Recent expenses" panel next to the chart on the Dashboard.

## Requirements
Refer to the frontend `CLAUDE.md` § 4 (`RecentExpenses.jsx`) and the root `CLAUDE.md` § 6.
- `RecentExpenses.jsx` shows the latest 5 expenses (date, category, description, amount).
- No Edit/Delete buttons.
- "View all →" switches to the Expenses view.
- Respects the selected category.
- Two-column layout with the chart on desktop, stacked at ≤900px.

## Notes
- The API already returns expenses newest first, so slicing the first 5 is enough.
