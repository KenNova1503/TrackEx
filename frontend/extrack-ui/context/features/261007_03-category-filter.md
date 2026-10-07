# Category Filter (Sidebar)

## Overview
Fill the sidebar with the category list so the user can filter by category. The selection lives in `App.jsx` so both views can use it.

## Requirements
Refer to the frontend `CLAUDE.md` § 4 (`Sidebar.jsx`) and the root `CLAUDE.md` § 7 (filter data flow).
- `Sidebar.jsx` fetches categories with `getCategories()` and shows an "All Expenses" button plus one button per category.
- `App.jsx` holds `selectedCategory` (`null` = all) and passes it and a setter to `Sidebar`.
- The active button is highlighted.
- Show loading and error states.

## Notes
- Declare the fetch function inside `useEffect` so `eslint-plugin-react-hooks` doesn't warn.
- The selection must survive switching between views.
- Out of scope: per-category counts like "Food (8)".
