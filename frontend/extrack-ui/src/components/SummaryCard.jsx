// One KPI tile on the Dashboard: label, big value, optional subtitle
function SummaryCard({ label, value, subtitle }) {
  return (
    <div className="summary-card">
      <div className="card-label">{label}</div>
      <div className="card-value">{value}</div>
      {subtitle && <div className="card-subtitle">{subtitle}</div>}
    </div>
  )
}

export default SummaryCard
