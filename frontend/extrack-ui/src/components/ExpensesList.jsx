import { useEffect, useState } from 'react'
import ExpenseTable from './ExpenseTable'
import ExpenseForm from './ExpenseForm'
import { getExpenses } from '../services/api'
import '../styles/ExpensesList.css'

function ExpensesList({ selectedCategory, refreshTrigger, onExpensesChanged }) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

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
    setShowForm(false)
    onExpensesChanged()
  }

  return (
    <div className="expenses-list">
      <div className="list-header">
        <h1>Expenses</h1>
        <button type="button" className="btn-primary" onClick={() => setShowForm(true)}>
          + Add Expense
        </button>
      </div>

      {showForm && (
        <ExpenseForm onClose={() => setShowForm(false)} onSaved={handleSaved} />
      )}

      {loading && <p className="status-message">Loading expenses…</p>}

      {!loading && error && (
        <p className="status-message error" role="alert">
          Couldn't load expenses: {error}
        </p>
      )}

      {!loading && !error && expenses.length === 0 && (
        <p className="status-message">No expenses found.</p>
      )}

      {!loading && !error && expenses.length > 0 && (
        <ExpenseTable expenses={expenses} />
      )}
    </div>
  )
}

export default ExpensesList
