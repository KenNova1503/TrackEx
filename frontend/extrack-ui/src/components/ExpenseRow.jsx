import { formatCurrency, formatDate } from '../utils/format'

function ExpenseRow({ expense, onEdit, onDelete }) {
  // Screen readers hear which row a button acts on, not just "Edit"/"Delete"
  const label = expense.description || expense.categoryName

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
          aria-label={`Edit ${label} expense`}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn-sm btn-danger"
          onClick={() => onDelete(expense)}
          aria-label={`Delete ${label} expense`}
        >
          Delete
        </button>
      </td>
    </tr>
  )
}

export default ExpenseRow
