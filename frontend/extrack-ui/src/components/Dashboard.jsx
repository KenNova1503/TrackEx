import { useEffect, useState } from 'react'
import SummaryCard from './SummaryCard'
import { getExpenses, getMonthlySummary } from '../services/api'
import { formatCurrency } from '../utils/format'
import { computeSummary } from '../utils/summary'
import '../styles/Dashboard.css'

const monthName = new Intl.DateTimeFormat(undefined, { month: 'long' }).format(new Date())
const shortMonth = new Intl.DateTimeFormat(undefined, { month: 'short' })
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`
const percent = (n) => `${n.toFixed(1)}%`

// Last month's comparison window, e.g. "Sep 1–8" (or "Sep 1" on the 1st)
const comparisonRange = (s) => {
  const month = shortMonth.format(s.lastMonthDate)
  return s.comparisonDay === 1 ? `${month} 1` : `${month} 1–${s.comparisonDay}`
}

// Chart and recent expenses join the cards in tasks 09–10
function Dashboard({ selectedCategory }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Re-fetch when the category filter changes (the Dashboard remounts on every visit)
  useEffect(() => {
    let ignore = false

    const fetchSummary = async () => {
      setLoading(true)
      setError('')
      try {
        // In parallel; the unfiltered monthly totals are only needed for a category's share
        const [expenses, monthly, allMonthly] = await Promise.all([
          getExpenses(selectedCategory),
          getMonthlySummary(selectedCategory),
          selectedCategory ? getMonthlySummary() : null,
        ])
        if (!ignore) setSummary(computeSummary({ expenses, monthly, allMonthly }))
      } catch (err) {
        if (!ignore) setError(err.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchSummary()
    return () => {
      ignore = true
    }
  }, [selectedCategory])

  const renderCards = (s) => {
    const changeValue = s.change === null
      ? 'No data'
      : s.change === 0
        ? 'No change'
        : `${s.change > 0 ? '▲' : '▼'} ${percent(Math.abs(s.change))}`

    return (
      <div className="summary-cards">
        <SummaryCard
          label="Total spent this month"
          value={formatCurrency(s.thisMonthTotal)}
          subtitle={`${plural(s.count, 'expense')} in ${monthName}`}
        />
        <SummaryCard
          label="Number of expenses"
          value={s.count}
          subtitle={s.average === null ? 'None yet this month' : `Avg ${formatCurrency(s.average)}`}
        />
        {selectedCategory ? (
          // Filtered: "top category" would always be the selected one, so show its share instead
          <SummaryCard
            label="Share of this month's spending"
            value={s.share === null ? '—' : percent(s.share)}
            subtitle={`of ${formatCurrency(s.allThisMonthTotal)} across all categories`}
          />
        ) : (
          <SummaryCard
            label="Top category"
            value={s.topCategory?.name ?? '—'}
            subtitle={s.topCategory
              ? `${formatCurrency(s.topCategory.total)} · ${percent(s.topCategory.share)} of this month`
              : 'No expenses this month'}
          />
        )}
        {/* Month-to-date vs the same days last month, so early-month numbers aren't skewed */}
        <SummaryCard
          label="vs last month"
          value={changeValue}
          subtitle={s.lastMonthToDate > 0
            ? `${formatCurrency(s.lastMonthToDate)} on ${comparisonRange(s)}`
            : `No spending on ${comparisonRange(s)}`}
        />
      </div>
    )
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {/* "Loading…" only before the first result; filter changes keep the cards, dimmed */}
      {loading && !summary && <p className="status-message">Loading summary…</p>}

      {!loading && error && (
        <p className="status-message error" role="alert">
          Couldn't load the summary: {error}
        </p>
      )}

      {summary && !(error && !loading) && (
        <div className={loading ? 'is-refreshing' : ''} aria-busy={loading}>
          {renderCards(summary)}
        </div>
      )}
    </div>
  )
}

export default Dashboard
