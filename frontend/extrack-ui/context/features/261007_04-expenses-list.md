# Expenses List (Read-Only)

## Overview
Show the expenses table in the Expenses view, filtered by the selected category. No add, edit or delete yet.

## Requirements
Refer to the frontend `CLAUDE.md` § 4 (`ExpensesList.jsx`, `ExpenseTable.jsx`, `ExpenseRow.jsx`) and § 6 (`ExpensesList.css`).
- `ExpensesList.jsx` fetches with `getExpenses(selectedCategory)` and re-fetches when `selectedCategory` or `refreshTrigger` changes.
- `ExpenseTable.jsx` and `ExpenseRow.jsx` show date, category, description and amount.
- Loading, empty ("No expenses found") and error states.
- Amounts formatted to 2 decimals; dates in the user's locale.

## Notes
- No Edit/Delete buttons yet (tasks 06 and 07); leave out the Actions column for now.
- Declare the fetch function inside `useEffect`.
- Add a few expenses with Postman or Swagger first if the database is empty.
