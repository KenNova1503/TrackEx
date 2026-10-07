# Delete Expense

## Overview
Add a Delete button on each row, with a confirmation and an optimistic update.

## Requirements
Refer to the frontend `CLAUDE.md` § 4 (`ExpenseRow.jsx`) and the root `CLAUDE.md` § 9 ("Optimistic updates").
- Delete button in the Actions column, after a `window.confirm`.
- Remove the row from state immediately, then call `deleteExpense(id)`.
- If the request fails, put the row back and show an error message.
- After a successful delete, trigger a refresh so the Dashboard is up to date.

## Notes
- `DELETE` returns `204 No Content`; `fetchJSON` must already handle this (task 01).
- Use the functional `setExpenses(prev => ...)` form so the rollback doesn't use stale state.
