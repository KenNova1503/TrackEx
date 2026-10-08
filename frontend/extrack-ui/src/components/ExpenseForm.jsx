import { useEffect, useState } from 'react'
import { createExpense, getCategories } from '../services/api'
import '../styles/Modal.css'

// Same limits as the backend (Expense.MAX_AMOUNT / Expense.MAX_DESCRIPTION_LENGTH)
const MAX_AMOUNT = 99_999_999.99
const MAX_DESCRIPTION_LENGTH = 500

// First option of the category dropdown, per loading state
const CATEGORY_PLACEHOLDER = {
  loading: 'Loading categories…',
  loaded: 'Select a category',
  error: 'Categories unavailable',
}

// Today as "YYYY-MM-DD" in local time. toISOString() would give the UTC date,
// which is still yesterday before 08:00 in UTC+8.
const todayLocal = () => {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

// Returns the first problem as a message, or '' when the form is valid
const validate = (form) => {
  const amountText = form.amount.trim()
  if (amountText === '') return 'Amount is required.'
  // Allow a leading "-" here so negative amounts get the "greater than 0" message below
  if (!/^-?\d+(\.\d{1,2})?$/.test(amountText)) return 'Amount must be a number with up to 2 decimal places.'
  const amount = Number(amountText)
  if (amount <= 0) return 'Amount must be greater than 0.'
  if (amount > MAX_AMOUNT) return 'Amount cannot exceed 99,999,999.99.'
  if (!form.categoryId) return 'Please select a category.'
  if (!form.date) return 'Date is required.'
  if (form.description.length > MAX_DESCRIPTION_LENGTH) {
    return `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`
  }
  return ''
}

function ExpenseForm({ onClose, onSaved }) {
  // Inputs stay strings while typing; they're converted once, on submit
  const [form, setForm] = useState({
    amount: '',
    categoryId: '',
    date: todayLocal(),
    description: '',
  })
  const [categories, setCategories] = useState([])
  const [categoriesStatus, setCategoriesStatus] = useState('loading')  // 'loading' | 'loaded' | 'error'
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Categories for the dropdown
  useEffect(() => {
    let ignore = false

    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        if (ignore) return
        setCategories(data)
        setCategoriesStatus('loaded')
      } catch (err) {
        if (ignore) return
        setError(`Couldn't load categories: ${err.message}`)
        setCategoriesStatus('error')
      }
    }

    fetchCategories()
    return () => {
      ignore = true
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const message = validate(form)
    if (message) {
      setError(message)
      return
    }

    setError('')
    setSaving(true)
    try {
      await createExpense({
        amount: Number(form.amount),
        categoryId: Number(form.categoryId),  // the API rejects "2" for an int
        date: `${form.date}T00:00:00`,          // local date, no time zone (same format the API returns)
        description: form.description.trim() || null,
      })
      onSaved()  // parent closes the modal and refreshes the list
    } catch (err) {
      // Show the backend's { message } (e.g. an unknown category) and let the user retry
      setError(err.message || 'Failed to save expense.')
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="expense-form-title">
        <h2 id="expense-form-title">Add Expense</h2>

        {error && <div className="form-error" role="alert">{error}</div>}

        {/* noValidate: our own messages replace the browser's validation popups */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="amount">Amount <span className="required" aria-hidden="true">*</span></label>
            <input
              id="amount"
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              max={MAX_AMOUNT}
              placeholder="0.00"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="categoryId">Category <span className="required" aria-hidden="true">*</span></label>
            <select
              id="categoryId"
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              disabled={categoriesStatus !== 'loaded'}
              required
            >
              <option value="">{CATEGORY_PLACEHOLDER[categoriesStatus]}</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date">Date <span className="required" aria-hidden="true">*</span></label>
            <input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              maxLength={MAX_DESCRIPTION_LENGTH}
              placeholder="Optional"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ExpenseForm
