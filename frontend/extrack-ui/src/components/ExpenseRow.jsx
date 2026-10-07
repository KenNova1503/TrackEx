import { formatCurrency, formatDate } from '../utils/format'

// Read-only for now: the Actions column (Edit/Delete) comes in tasks 06–07
function ExpenseRow({ expense }) {
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
    </tr>
  )
}

export default ExpenseRow
