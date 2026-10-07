# Edit Expense

## Overview
Reuse `ExpenseForm` in edit mode from an Edit button on each row.

## Requirements
Refer to the frontend `CLAUDE.md` § 4 (`ExpenseForm.jsx`, `ExpenseRow.jsx`) and the root `CLAUDE.md` § 7 (edit flow).
- Add an Actions column with an Edit button to `ExpenseRow.jsx`.
- Edit opens the modal pre-filled (amount, category, date without the time part, description).
- Title "Edit Expense" and an "Update" button in edit mode.
- Save sends `updateExpense(id, data)` with the same conversion and validation as task 05.
- On success: close the modal and refresh the list.

## Notes
- Pre-fill from the `expense` prop when the form opens; don't re-fetch the expense.
- Out of scope: delete.
