import { formatCurrency, formatDate } from '../utils/format'

// The Delete button joins Edit in task 07
function ExpenseRow({ expense, onEdit }) {
  return (
    <tr>
      <td>{formatDate(expense.date)}</td>
      <td>
        <span className="category-badge">{expense.categoryName}</span>
      </td>
      <td className={expense.description ? '' : 'muted'}>
        {expense.description || '—'}
      </td>
      <td className="amount">{formatCurrency(expense.amount)}</td>
      <td className="actions">
        <button
          type="button"
          className="btn-sm"
          onClick={() => onEdit(expense)}
          // Screen readers hear which row the button edits, not just "Edit"
          aria-label={`Edit ${expense.description || expense.categoryName} expense`}
        >
          Edit
        </button>
      </td>
    </tr>
  )
}

export default ExpenseRow
