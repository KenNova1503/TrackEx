// Numbers behind the Dashboard summary cards and category chart. Kept free of React so it's easy to test.
// Every figure covers the current calendar month (local time); "vs last month" compares
// month-to-date with the same days of last month.

// "YYYY-MM" for a Date, in local time
const monthKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

// Total for one month from /summary/monthly, which only lists months that have expenses
// (so look the month up by year and month instead of taking the first rows)
const monthTotal = (monthly, date) =>
  monthly.find(m => m.year === date.getFullYear() && m.month === date.getMonth() + 1)?.total ?? 0

// Sum of a month's expenses from day 1 up to and including `lastDay`.
// API dates look like "2026-10-06T00:00:00" (no time zone): chars 0–6 are the month, 8–9 the day.
const totalUpToDay = (expenses, key, lastDay) =>
  expenses
    .filter(e => e.date.slice(0, 7) === key && Number(e.date.slice(8, 10)) <= lastDay)
    .reduce((sum, e) => sum + e.amount, 0)

// This month's spending per category, highest first: [{ categoryId, categoryName, total }].
// Feeds both the "Top category" card and the category chart, so they always agree.
export const categoryTotals = (expenses, now = new Date()) => {
  const key = monthKey(now)
  const totals = new Map()
  for (const e of expenses) {
    if (e.date.slice(0, 7) !== key) continue
    const entry = totals.get(e.categoryId) ?? { categoryId: e.categoryId, categoryName: e.categoryName, total: 0 }
    entry.total += e.amount
    totals.set(e.categoryId, entry)
  }
  return [...totals.values()].sort((a, b) => b.total - a.total)
}

// "YYYY-MM-DD" for a Date, in local time
const dayKey = (date) => `${monthKey(date)}-${String(date.getDate()).padStart(2, '0')}`

// The latest `limit` expenses up to and including today, across all months.
// Future-dated expenses are left out ("recent" means already happened).
// Newest date first; same-day expenses by id, newest first, so the order doesn't
// depend on how the API happens to order ties (it sorts by date only).
export const recentExpenses = (expenses, now = new Date(), limit = 5) => {
  const today = dayKey(now)
  return expenses
    .filter(e => e.date.slice(0, 10) <= today)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
    .slice(0, limit)
}

// expenses:    rows for the current filter (all rows, or one category's)
// monthly:     /summary/monthly for the same filter
// allExpenses: every row, all categories (only needed when a category is selected, for its share)
export const computeSummary = ({ expenses, monthly, allExpenses = null, now = new Date() }) => {
  const thisMonthKey = monthKey(now)
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)  // handles January

  const thisMonthTotal = monthTotal(monthly, now)

  // "vs last month" compares the same days: this month 1..today with last month 1..today.
  // Comparing a part month with a whole month would read ▼ ~99% early in every month.
  // If last month is shorter (e.g. on Mar 31), it stops at last month's final day.
  const daysInLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate()
  const comparisonDay = Math.min(now.getDate(), daysInLastMonth)
  const thisMonthToDate = totalUpToDay(expenses, thisMonthKey, now.getDate())
  const lastMonthToDate = totalUpToDay(expenses, monthKey(lastMonthDate), comparisonDay)

  const thisMonthExpenses = expenses.filter(e => e.date.slice(0, 7) === thisMonthKey)
  const count = thisMonthExpenses.length

  // Highest-spending category this month (/summary/category is all-time, so compute it here)
  const top = categoryTotals(expenses, now)[0] ?? null

  // Selected category's share of everyone's spending this month
  const allThisMonthTotal = allExpenses
    ? categoryTotals(allExpenses, now).reduce((sum, c) => sum + c.total, 0)
    : thisMonthTotal

  return {
    thisMonthTotal,
    // Month-to-date comparison (see above); the range is last month 1..comparisonDay
    thisMonthToDate,
    lastMonthToDate,
    lastMonthDate,
    comparisonDay,
    // % change; null when last month had no spending in that range to compare with
    change: lastMonthToDate > 0 ? ((thisMonthToDate - lastMonthToDate) / lastMonthToDate) * 100 : null,
    count,
    average: count > 0 ? thisMonthTotal / count : null,
    topCategory: top
      ? { name: top.categoryName, total: top.total, share: (top.total / thisMonthTotal) * 100 }
      : null,
    allThisMonthTotal,
    share: allThisMonthTotal > 0 ? (thisMonthTotal / allThisMonthTotal) * 100 : null,
  }
}
