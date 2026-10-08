import { useEffect, useState } from 'react'
import ExpenseTable from './ExpenseTable'
import ExpenseForm from './ExpenseForm'
import ConfirmDialog from './ConfirmDialog'
import { deleteExpense, getExpenses } from '../services/api'
import { formatCurrency, formatDate } from '../utils/format'
import '../styles/ExpensesList.css'

function ExpensesList({ selectedCategory, refreshTrigger, onExpensesChanged }) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Error from a row action (delete), shown above the table without hiding it
  const [actionError, setActionError] = useState('')
  // Which form is open: null = closed, { expense: null } = add, { expense } = edit that row
  const [formState, setFormState] = useState(null)
  // Row waiting for the user to confirm deletion (null = no dialog)
  const [pendingDelete, setPendingDelete] = useState(null)

  // Re-fetch when the category filter changes or a refresh is requested
  useEffect(() => {
    // Ignore a stale response if the filter changes (or the view unmounts) before it arrives
    let ignore = false

    const fetchExpenses = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getExpenses(selectedCategory)
        if (!ignore) setExpenses(data)
      } catch (err) {
        if (!ignore) setError(err.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchExpenses()
    return () => {
      ignore = true
    }
  }, [selectedCategory, refreshTrigger])

  // Saved: close the modal and let App bump refreshTrigger, which re-runs the fetch above
  const handleSaved = () => {
    setFormState(null)
    onExpensesChanged()
  }

  // Optimistic delete (runs after the user confirms): the row disappears at once;
  // if the server refuses, it comes back
  const handleDelete = async (expense) => {
    const label = expense.description || expense.categoryName
    setPendingDelete(null)
    setActionError('')
    const index = expenses.findIndex(e => e.id === expense.id)  // where to put it back on failure
    setExpenses(prev => prev.filter(e => e.id !== expense.id))

    try {
      await deleteExpense(expense.id)
      onExpensesChanged()  // background re-fetch keeps the list (and Dashboard) in sync
    } catch (err) {
      // Functional update: restore into the latest list, not the one from before the click
      setExpenses(prev => {
        if (prev.some(e => e.id === expense.id)) return prev  // already back (e.g. a refresh)
        const next = [...prev]
        next.splice(Math.min(index, next.length), 0, expense)
        return next
      })
      setActionError(`Couldn't delete "${label}": ${err.message}`)
    }
  }

  // "Loading…" only when there's nothing to show yet; later re-fetches (filter change,
  // refresh after add/edit/delete) keep the current rows on screen, dimmed, until the
  // new data arrives instead of blinking the whole table
  const showTable = expenses.length > 0 && !(error && !loading)

  return (
    <div className="expenses-list">
      <div className="list-header">
        <h1>Expenses</h1>
        <button type="button" className="btn-primary" onClick={() => setFormState({ expense: null })}>
          + Add Expense
        </button>
      </div>

      {formState && (
        <ExpenseForm
          expense={formState.expense}
          onClose={() => setFormState(null)}
          onSaved={handleSaved}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete expense?"
          message={
            `"${pendingDelete.description || pendingDelete.categoryName}" ` +
            `(${formatCurrency(pendingDelete.amount)}, ${formatDate(pendingDelete.date)}) ` +
            'will be permanently deleted.'
          }
          confirmLabel="Delete"
          onConfirm={() => handleDelete(pendingDelete)}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {actionError && (
        <div className="action-error" role="alert">
          <span>{actionError}</span>
          <button type="button" className="btn-sm" onClick={() => setActionError('')}>
            Dismiss
          </button>
        </div>
      )}

      {loading && expenses.length === 0 && (
        <p className="status-message">Loading expenses…</p>
      )}

      {!loading && error && (
        <p className="status-message error" role="alert">
          Couldn't load expenses: {error}
        </p>
      )}

      {!loading && !error && expenses.length === 0 && (
        <p className="status-message">No expenses found.</p>
      )}

      {showTable && (
        <div className={loading ? 'is-refreshing' : ''} aria-busy={loading}>
          <ExpenseTable
            expenses={expenses}
            onEdit={expense => setFormState({ expense })}
            onDelete={setPendingDelete}
          />
        </div>
      )}
    </div>
  )
}

export default ExpensesList
