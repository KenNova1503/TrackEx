import { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import ExpensesList from './components/ExpensesList'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')  // 'dashboard' or 'expenses'
  // Lives here (not in a view) so the filter survives switching views
  const [selectedCategory, setSelectedCategory] = useState(null)  // null = all expenses
  // Bumping this number makes the views re-fetch after an expense is added, edited or deleted
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleExpensesChanged = () => setRefreshTrigger(prev => prev + 1)

  return (
    <div className="app-container">
      <Header currentView={currentView} onNavigate={setCurrentView} />
      <div className="main-layout">
        <Sidebar selectedCategory={selectedCategory} onCategorySelect={setSelectedCategory} />
        <main className="main-content">
          {currentView === 'dashboard' && <Dashboard selectedCategory={selectedCategory} />}
          {currentView === 'expenses' && (
            <ExpensesList
              selectedCategory={selectedCategory}
              refreshTrigger={refreshTrigger}
              onExpensesChanged={handleExpensesChanged}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
