import { useEffect, useRef, useState } from 'react'
import { BarController, BarElement, CategoryScale, Chart, LinearScale, Tooltip } from 'chart.js'
import { formatCurrency, formatCurrencyCompact } from '../utils/format'

// Register only what a bar chart needs (instead of 'chart.js/auto') to keep the bundle small
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)

const darkMode = window.matchMedia('(prefers-color-scheme: dark)')

// Theme colors come from the CSS variables in App.css, so the chart matches light/dark mode
const readTheme = () => {
  const css = getComputedStyle(document.documentElement)
  const token = (name) => css.getPropertyValue(name).trim()
  return {
    primary: token('--primary'),
    muted: token('--chart-muted'),
    text: token('--text-secondary'),
    grid: token('--border'),
    font: token('--font-family'),
  }
}

// data: [{ categoryId, categoryName, total }] for this month, highest first
// selectedCategory: id to highlight (others muted), or null to color every bar
function CategoryChart({ data, selectedCategory }) {
  const canvasRef = useRef(null)
  // Bumped when the OS switches light/dark, so the effect below redraws with the new colors
  const [themeVersion, setThemeVersion] = useState(0)

  useEffect(() => {
    const onChange = () => setThemeVersion(v => v + 1)
    darkMode.addEventListener('change', onChange)
    return () => darkMode.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (data.length === 0) return

    const theme = readTheme()
    const chart = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: data.map(d => d.categoryName),
        datasets: [{
          label: 'Spent this month',
          data: data.map(d => d.total),
          backgroundColor: data.map(d =>
            selectedCategory === null || d.categoryId === selectedCategory ? theme.primary : theme.muted),
          borderRadius: 4,
          maxBarThickness: 28,
        }],
      },
      options: {
        indexAxis: 'y',  // horizontal bars: category names read left to right
        responsive: true,
        maintainAspectRatio: false,  // the container sets the height (see below)
        animation: { duration: 300 },
        font: { family: theme.font },
        plugins: {
          tooltip: {
            callbacks: { label: (ctx) => formatCurrency(ctx.parsed.x) },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { color: theme.text, callback: (value) => formatCurrencyCompact(value) },
            grid: { color: theme.grid },
            border: { display: false },
          },
          y: {
            ticks: { color: theme.text },
            grid: { display: false },
            border: { color: theme.grid },
          },
        },
      },
    })

    // Destroyed on unmount and before the next draw (new data, filter or theme)
    return () => chart.destroy()
  }, [data, selectedCategory, themeVersion])

  // The canvas itself is invisible to screen readers, so describe the bars in text
  const description = data
    .map(d => `${d.categoryName} ${formatCurrency(d.total)}`)
    .join(', ')

  return (
    <section className="chart-card" aria-labelledby="category-chart-title">
      <h2 id="category-chart-title">Spending by category</h2>
      <p className="chart-subtitle">This month</p>

      {data.length === 0 ? (
        <p className="chart-empty">No expenses this month.</p>
      ) : (
        // Height grows with the number of bars so they never get squashed
        <div className="chart-canvas" style={{ height: `${Math.max(140, data.length * 36 + 40)}px` }}>
          <canvas ref={canvasRef} role="img" aria-label={`Spending by category this month: ${description}`} />
        </div>
      )}
    </section>
  )
}

export default CategoryChart
