import { useEffect, useState } from 'react'
import SummaryCard from './SummaryCard'
import CategoryChart from './CategoryChart'
import RecentExpenses from './RecentExpenses'
import { getExpenses, getMonthlySummary } from '../services/api'
import { formatCurrency } from '../utils/format'
import { categoryTotals, computeSummary, recentExpenses } from '../utils/summary'
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

// onNavigate switches views (used by "View all →" in Recent expenses)
function Dashboard({ selectedCategory, onNavigate }) {
  const [summary, setSummary] = useState(null)
  const [chartData, setChartData] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Re-fetch when the category filter changes (the Dashboard remounts on every visit)
  useEffect(() => {
    let ignore = false

    const fetchSummary = async () => {
      setLoading(true)
      setError('')
      try {
        // All expenses (not just the selected category's): the chart shows every category with
        // the selected one highlighted, and the share card compares against the total.
        // The cards then filter this one list in the browser.
        const [allExpenses, monthly] = await Promise.all([
          getExpenses(),
          getMonthlySummary(selectedCategory),
        ])
        if (ignore) return

        const expenses = selectedCategory
          ? allExpenses.filter(e => e.categoryId === selectedCategory)
          : allExpenses
        setSummary(computeSummary({
          expenses,
          monthly,
          allExpenses: selectedCategory ? allExpenses : null,
        }))
        setChartData(categoryTotals(allExpenses))
        setRecent(recentExpenses(expenses))  // follows the filter; any month, up to today
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
          <div className="dashboard-content">
            <CategoryChart data={chartData} selectedCategory={selectedCategory} />
            <RecentExpenses
              expenses={recent}
              filtered={selectedCategory !== null}
              onViewAll={() => onNavigate('expenses')}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
