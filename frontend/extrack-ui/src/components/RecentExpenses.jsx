import { formatCurrency, formatDate } from '../utils/format'

// Read-only list of the latest expenses (up to today, any month) next to the chart.
// Editing and deleting live in the Expenses view; "View all →" goes there.
// filtered: a category is selected (changes the empty-state wording)
function RecentExpenses({ expenses, filtered, onViewAll }) {
  return (
    <section className="recent-card" aria-labelledby="recent-expenses-title">
      <div className="recent-header">
        <div>
          <h2 id="recent-expenses-title">Recent expenses</h2>
          <p className="recent-subtitle">Latest up to today</p>
        </div>
        {/* aria-label so screen readers don't read the arrow as "right arrow" */}
        <button type="button" className="btn-link" onClick={onViewAll} aria-label="View all expenses">
          View all →
        </button>
      </div>

      {expenses.length === 0 ? (
        <p className="recent-empty">
          {filtered ? 'No expenses in this category yet.' : 'No expenses yet.'}
        </p>
      ) : (
        <ul className="recent-list">
          {expenses.map(expense => (
            <li key={expense.id} className="recent-item">
              <div className="recent-main">
                {/* title shows the full text on hover when a long description is cut off */}
                <span className="recent-description" title={expense.description || expense.categoryName}>
                  {expense.description || expense.categoryName}
                </span>
                <span className="recent-meta">
                  {formatDate(expense.date)}
                  <span className="category-badge">{expense.categoryName}</span>
                </span>
              </div>
              <span className="recent-amount">{formatCurrency(expense.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default RecentExpenses
