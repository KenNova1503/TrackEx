import { useState } from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import ExpensesList from './components/ExpensesList'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')  // 'dashboard' or 'expenses'

  return (
    <div className="app-container">
      <Header currentView={currentView} onNavigate={setCurrentView} />
      <div className="main-layout">
        {/* Placeholder: the category filter (Sidebar.jsx) comes in task 03 */}
        <aside className="sidebar">
          <h2 className="sidebar-title">Categories</h2>
        </aside>
        <main className="main-content">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'expenses' && <ExpensesList />}
        </main>
      </div>
    </div>
  )
}

export default App
