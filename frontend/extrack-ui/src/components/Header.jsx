const VIEWS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'expenses', label: 'Expenses' },
]

function Header({ currentView, onNavigate }) {
  return (
    <header className="header">
      <span className="logo">ExTrack</span>
      <nav className="nav" aria-label="Main">
        {VIEWS.map(view => (
          <button
            key={view.id}
            type="button"
            className={`nav-btn ${currentView === view.id ? 'active' : ''}`}
            aria-current={currentView === view.id ? 'page' : undefined}
            onClick={() => onNavigate(view.id)}
          >
            {view.label}
          </button>
        ))}
      </nav>
    </header>
  )
}

export default Header
