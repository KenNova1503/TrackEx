# Add Expense

## Overview
Add the "+ Add Expense" button and the `ExpenseForm` modal in add mode.

## Requirements
Refer to the frontend `CLAUDE.md` § 4 (`ExpenseForm.jsx`) and § 6 (`Modal.css`), and the root `CLAUDE.md` § 7 (add flow).
- "+ Add Expense" button in `ExpensesList.jsx` opens the modal.
- Fields: amount, category (dropdown), date (defaults to today), description (optional).
- Keep the inputs as strings in state; convert on submit (`Number(amount)`, `Number(categoryId)`).
- Client-side validation matching the backend: amount > 0 and ≤ 99,999,999.99, category required, date required, description ≤ 500 characters.
- Show the backend's `{ message }` in the form when the request fails.
- On success: close the modal and trigger a refresh so the new row appears.

## Notes
- Don't use `parseFloat` in `handleChange` (an empty field becomes `NaN`), and don't send `categoryId` as a string (the API rejects `"2"` for an `int`).
- Default the date to today's **local** date. `new Date().toISOString()` gives the UTC date, which is yesterday before 08:00 in UTC+8.
- Out of scope: edit mode, Esc/focus handling (task 11).
