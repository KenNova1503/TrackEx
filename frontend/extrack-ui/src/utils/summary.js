// Numbers behind the Dashboard summary cards. Kept free of React so it's easy to test.
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

// expenses:   rows from getExpenses(categoryId) (already filtered by category)
// monthly:    /summary/monthly for the same filter
// allMonthly: /summary/monthly for all categories (only needed when a category is selected)
export const computeSummary = ({ expenses, monthly, allMonthly = null, now = new Date() }) => {
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
  const totalsByCategory = {}
  for (const e of thisMonthExpenses) {
    totalsByCategory[e.categoryName] = (totalsByCategory[e.categoryName] ?? 0) + e.amount
  }
  const [topName, topTotal] =
    Object.entries(totalsByCategory).sort((a, b) => b[1] - a[1])[0] ?? [null, 0]

  // Selected category's share of everyone's spending this month
  const allThisMonthTotal = allMonthly ? monthTotal(allMonthly, now) : thisMonthTotal

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
    topCategory: topName
      ? { name: topName, total: topTotal, share: (topTotal / thisMonthTotal) * 100 }
      : null,
    allThisMonthTotal,
    share: allThisMonthTotal > 0 ? (thisMonthTotal / allThisMonthTotal) * 100 : null,
  }
}
