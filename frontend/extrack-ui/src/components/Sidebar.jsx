import { useEffect, useState } from 'react'
import { getCategories } from '../services/api'

function Sidebar({ selectedCategory, onCategorySelect }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Ignore a response that arrives after unmount (e.g. StrictMode's double mount in dev)
    let ignore = false

    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        if (!ignore) setCategories(data)
      } catch (err) {
        if (!ignore) setError(err.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchCategories()
    return () => {
      ignore = true
    }
  }, [])

  // One button per filter option; null = all expenses
  const renderButton = (id, label) => (
    <button
      key={id ?? 'all'}
      type="button"
      className={`category-btn ${selectedCategory === id ? 'active' : ''}`}
      aria-pressed={selectedCategory === id}
      onClick={() => onCategorySelect(id)}
    >
      {label}
    </button>
  )

  return (
    <aside className="sidebar" aria-label="Category filter">
      {/* Inner wrapper sticks while scrolling; the aside itself stays full height */}
      <div className="sidebar-content">
        {/* A plain label, not a heading, so the view's h1 stays the first heading on the page */}
        <p className="sidebar-title" id="category-filter-label">Categories</p>

        {loading && <p className="sidebar-status">Loading…</p>}

        {error && (
          <p className="sidebar-status sidebar-error" role="alert">
            Couldn't load categories: {error}
          </p>
        )}

        {!loading && !error && (
          <div className="category-list" role="group" aria-labelledby="category-filter-label">
            {renderButton(null, 'All Expenses')}
            {categories.map(category => renderButton(category.id, category.name))}
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
