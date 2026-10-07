import { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import ExpensesList from './components/ExpensesList'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')  // 'dashboard' or 'expenses'
  // Lives here (not in a view) so the filter survives switching views
  const [selectedCategory, setSelectedCategory] = useState(null)  // null = all expenses
  // Bumping this number makes the views re-fetch; the setter is added in task 05 (add expense)
  const [refreshTrigger] = useState(0)

  return (
    <div className="app-container">
      <Header currentView={currentView} onNavigate={setCurrentView} />
      <div className="main-layout">
        <Sidebar selectedCategory={selectedCategory} onCategorySelect={setSelectedCategory} />
        <main className="main-content">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'expenses' && (
            <ExpensesList selectedCategory={selectedCategory} refreshTrigger={refreshTrigger} />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
