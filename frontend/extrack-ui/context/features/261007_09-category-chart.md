# Category Chart

## Overview
Add the horizontal bar chart of spending by category to the Dashboard.

## Requirements
Refer to the frontend `CLAUDE.md` § 4 (`CategoryChart.jsx`) and § 9, and the root `CLAUDE.md` § 6.
- `npm install chart.js`.
- `CategoryChart.jsx`: horizontal bar chart (`indexAxis: 'y'`) from the category summary.
- Destroy the chart on unmount and before re-creating it when the data changes.
- Bar, grid and label colors follow the theme in both light and dark mode.
- Empty state when there's no data.

## Notes
- Read colors from the CSS variables (`getComputedStyle`) rather than hard-coding `#2a78d6`.
- Chart.js is the only extra library allowed on the frontend.
