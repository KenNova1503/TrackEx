// Shared display formatters (expenses table, dashboard cards, recent expenses)

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
})

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

// 1581.76 → "$1,581.76" (always 2 decimals, grouped thousands)
export const formatCurrency = (amount) => currencyFormatter.format(amount)

// "2026-10-06T00:00:00" → "Oct 6, 2026" in the user's locale.
// The API sends dates without a time zone, so they're parsed as local time.
export const formatDate = (isoDate) => dateFormatter.format(new Date(isoDate))
