# Frontend Context — Expense Tracker

**Framework**: React 19 (Hooks)  
**Language**: Plain JavaScript (JSX, no TypeScript)  
**Styling**: Basic CSS only (no Tailwind/Bootstrap)  
**HTTP**: Fetch API  
**Build Tool**: Vite

**For shared context** (API endpoints, database schema, design theme): See `../../CLAUDE.md` (root)

---

## **1. Quick Start: Frontend Setup**

### **Prerequisites**

- Node.js 16+ (LTS recommended)
- npm or yarn

### **Project Creation**

```bash
npm create vite@latest expense-tracker-frontend -- --template react
cd expense-tracker-frontend
npm install
npm run dev
```

Dev server runs on `http://localhost:5173`

### **Project Structure**

```
src/
├── components/
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   ├── Dashboard.jsx
│   ├── SummaryCard.jsx
│   ├── CategoryChart.jsx
│   ├── RecentExpenses.jsx
│   ├── ExpensesList.jsx
│   ├── ExpenseTable.jsx
│   ├── ExpenseRow.jsx
│   └── ExpenseForm.jsx
├── services/
│   └── api.js
├── styles/
│   ├── App.css
│   ├── Dashboard.css
│   ├── ExpensesList.css
│   ├── Modal.css
│   └── index.css
├── App.jsx
├── main.jsx
└── index.html
```

---

## **2. React Hooks Fundamentals**

### **useState: Managing Component State**

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);  // [current value, setter function]

  const increment = () => setCount(count + 1);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

**Key Points**:

- `useState` returns array: `[value, setValue]`
- Don't mutate state directly: `state.name = "Ken"` ❌
- Use setter: `setState(newValue)` ✅
- Multiple states allowed: `const [count, setCount] = useState(0); const [name, setName] = useState('');`

### **useEffect: Side Effects & Fetching Data**

```jsx
import { useEffect, useState } from 'react';

function ExpensesList({ selectedCategory }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Run once on component mount
  useEffect(() => {
    fetchExpenses();
  }, []);  // Empty dependency array = run once

  // Run when selectedCategory changes
  useEffect(() => {
    fetchExpenses();
  }, [selectedCategory]);  // Run when selectedCategory changes

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const url = selectedCategory
        ? `/api/expenses?categoryId=${selectedCategory}`
        : '/api/expenses';
      const response = await fetch(url);
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {expenses.map(expense => (
        <div key={expense.id}>{expense.description}</div>
      ))}
    </div>
  );
}
```

**Dependency Array Rules**:

- `[]` = Run **once** on mount (initial load)
- `[variable]` = Run when `variable` changes
- No array = Run on **every render** (infinite loop — avoid!)
- Multiple deps: `[dep1, dep2]` = Run when either changes

### **useCallback: Memoize Functions**

```jsx
import { useCallback, useState } from 'react';

function Parent() {
  const [expenses, setExpenses] = useState([]);

  // This function is recreated on every render (inefficient)
  const handleDelete1 = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // This function is only recreated when expenses changes (optimized)
  const handleDelete2 = useCallback((id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  }, [expenses]);

  return <ExpenseRow onDelete={handleDelete2} />;
}
```

**When to use**: When passing functions to child components (prevents unnecessary re-renders).

---

## **3. App Layout & Component Structure**

### **App.jsx** (Root component, holds shared state)

The app has two views (see root `CLAUDE.md` § 5). `currentView` decides which one renders; `selectedCategory` and `refreshTrigger` are shared so both views stay in sync.

```jsx
import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ExpensesList from './components/ExpensesList';
import './styles/App.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');  // 'dashboard' or 'expenses'
  const [selectedCategory, setSelectedCategory] = useState(null);  // null = all expenses
  const [refreshTrigger, setRefreshTrigger] = useState(0);  // Trigger re-fetch

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);  // Change value to trigger re-fetch
  };

  return (
    <div className="app-container">
      <Header currentView={currentView} onNavigate={setCurrentView} />
      <div className="main-layout">
        <Sidebar onCategorySelect={handleCategorySelect} selectedCategory={selectedCategory} />
        <main className="main-content">
          {currentView === 'dashboard' && (
            <Dashboard 
              selectedCategory={selectedCategory}
              refreshTrigger={refreshTrigger}
              onNavigate={setCurrentView}
            />
          )}
          {currentView === 'expenses' && (
            <ExpensesList
              selectedCategory={selectedCategory}
              onExpenseAdded={triggerRefresh}
              onExpenseUpdated={triggerRefresh}
              onExpenseDeleted={triggerRefresh}
              refreshTrigger={refreshTrigger}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
```

---

## **4. Core Components**

### **Header.jsx** (View navigation)

```jsx
function Header({ currentView, onNavigate }) {
  return (
    <header className="header">
      <span className="logo">ExTrack</span>
      <nav className="nav">
        <button
          className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onNavigate('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`nav-btn ${currentView === 'expenses' ? 'active' : ''}`}
          onClick={() => onNavigate('expenses')}
        >
          Expenses
        </button>
      </nav>
    </header>
  );
}

export default Header;
```

### **Sidebar.jsx** (Category Filter)

```jsx
import { useEffect, useState } from 'react';
import { getCategories } from '../services/api';
import '../styles/Sidebar.css';

function Sidebar({ onCategorySelect, selectedCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    onCategorySelect(null);  // null = fetch all
  };

  return (
    <aside className="sidebar">
      <h3>Categories</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="category-list">
          <button
            className={`category-btn ${selectedCategory === null ? 'active' : ''}`}
            onClick={handleSelectAll}
          >
            All Expenses
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => onCategorySelect(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
```

### **ExpensesList.jsx** (Main list view)

```jsx
import { useState, useEffect } from 'react';
import ExpenseForm from './ExpenseForm';
import ExpenseTable from './ExpenseTable';
import { getExpenses } from '../services/api';
import '../styles/ExpensesList.css';

function ExpensesList({
  selectedCategory,
  onExpenseAdded,
  onExpenseUpdated,
  onExpenseDeleted,
  refreshTrigger
}) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, [selectedCategory, refreshTrigger]);  // Re-fetch when filter or refresh trigger changes

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const data = await getExpenses(selectedCategory);
      setExpenses(data);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingExpense(null);  // Clear any editing state
    setShowForm(true);
  };

  const handleEditClick = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  const handleFormSubmit = (action) => {
    handleFormClose();
    if (action === 'add') onExpenseAdded();
    if (action === 'edit') onExpenseUpdated();
  };

  const handleDelete = (action) => {
    onExpenseDeleted();
  };

  return (
    <div className="expenses-list">
      <div className="list-header">
        <h2>Expenses</h2>
        <button className="btn-primary" onClick={handleAddClick}>
          + Add Expense
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}

      {!loading && expenses.length === 0 && (
        <p className="empty-state">No expenses found. Add one to get started!</p>
      )}

      {!loading && expenses.length > 0 && (
        <ExpenseTable
          expenses={expenses}
          onEdit={handleEditClick}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default ExpensesList;
```

### **ExpenseForm.jsx** (Add/Edit Modal)

```jsx
import { useState, useEffect } from 'react';
import { createExpense, updateExpense, getCategories } from '../services/api';
import '../styles/Modal.css';

function ExpenseForm({ expense, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    amount: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],  // Today's date
    description: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If editing, pre-fill form with expense data
    if (expense) {
      setFormData({
        amount: expense.amount,
        categoryId: expense.categoryId,
        date: expense.date.split('T')[0],  // Remove time part
        description: expense.description || ''
      });
    }

    // Fetch categories for dropdown
    fetchCategories();
  }, [expense]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!formData.amount || formData.amount <= 0) {
        setError('Amount must be greater than 0');
        setLoading(false);
        return;
      }
      if (!formData.categoryId) {
        setError('Please select a category');
        setLoading(false);
        return;
      }

      // API call
      if (expense) {
        // Edit mode
        await updateExpense(expense.id, formData);
        onSubmit('edit');
      } else {
        // Add mode
        await createExpense(formData);
        onSubmit('add');
      }
    } catch (err) {
      setError(err.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{expense ? 'Edit Expense' : 'Add Expense'}</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="amount">Amount *</label>
            <input
              id="amount"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="categoryId">Category *</label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              id="date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional notes..."
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (expense ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExpenseForm;
```

### **ExpenseTable.jsx** (Display expenses)

```jsx
import ExpenseRow from './ExpenseRow';
import '../styles/ExpensesList.css';

function ExpenseTable({ expenses, onEdit, onDelete }) {
  return (
    <table className="expenses-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Category</th>
          <th>Description</th>
          <th>Amount</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {expenses.map(expense => (
          <ExpenseRow
            key={expense.id}
            expense={expense}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </table>
  );
}

export default ExpenseTable;
```

### **ExpenseRow.jsx** (Single expense row)

```jsx
import { deleteExpense } from '../services/api';

function ExpenseRow({ expense, onEdit, onDelete }) {
  const handleEdit = () => {
    onEdit(expense);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this expense?')) return;

    try {
      await deleteExpense(expense.id);
      onDelete();
    } catch (error) {
      console.error('Failed to delete expense:', error);
      alert('Failed to delete expense');
    }
  };

  const formattedDate = new Date(expense.date).toLocaleDateString();

  return (
    <tr>
      <td>{formattedDate}</td>
      <td>
        <span className="category-badge">{expense.categoryName}</span>
      </td>
      <td>{expense.description || 'N/A'}</td>
      <td className="amount">${expense.amount.toFixed(2)}</td>
      <td className="actions">
        <button className="btn-sm" onClick={handleEdit}>Edit</button>
        <button className="btn-sm btn-danger" onClick={handleDelete}>Delete</button>
      </td>
    </tr>
  );
}

export default ExpenseRow;
```

### **Dashboard.jsx** (Summary view)

```jsx
import { useState, useEffect } from 'react';
import SummaryCard from './SummaryCard';
import CategoryChart from './CategoryChart';
import RecentExpenses from './RecentExpenses';
import { getExpenses, getMonthlySummary, getCategorySummary } from '../services/api';
import '../styles/Dashboard.css';

function Dashboard({ selectedCategory, refreshTrigger, onNavigate }) {
  const [totalSpent, setTotalSpent] = useState(0);
  const [expenseCount, setExpenseCount] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedCategory, refreshTrigger]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const expenses = await getExpenses(selectedCategory);
      const summary = await getCategorySummary();
      const monthly = await getMonthlySummary(selectedCategory);

      setExpenseCount(expenses.length);
      setTotalSpent(expenses.reduce((sum, e) => sum + e.amount, 0));
      setCategoryData(summary);
      setMonthlyData(monthly);
      setRecentExpenses(
        [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
      );
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const topCategory = categoryData.length > 0 ? categoryData[0] : null;

  // /summary/monthly only returns months that have expenses (newest first),
  // so look months up by year/month instead of taking the first two rows.
  const now = new Date();
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const totalFor = (date) =>
    monthlyData.find(m => m.year === date.getFullYear() && m.month === date.getMonth() + 1)?.total ?? 0;
  const thisMonthTotal = totalFor(now);
  const lastMonthTotal = totalFor(lastMonthDate);
  const monthChange = lastMonthTotal > 0
    ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
    : null;  // No spending last month → no meaningful % change

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="summary-cards">
        <SummaryCard
          label="Total spent this month"
          value={`$${thisMonthTotal.toFixed(2)}`}
          delta={`${expenseCount} expenses`}
        />
        <SummaryCard
          label="Number of expenses"
          value={expenseCount}
          delta={expenseCount > 0 ? `Avg $${(totalSpent / expenseCount).toFixed(2)}` : 'No data'}
        />
        {topCategory && (
          <>
            <SummaryCard
              label="Top category"
              value={topCategory.categoryName}
              delta={`$${topCategory.total.toFixed(2)} (${((topCategory.total / totalSpent) * 100).toFixed(1)}%)`}
            />
          </>
        )}
        <SummaryCard
          label="vs last month"
          value={monthChange === null
            ? 'No data'
            : `${monthChange >= 0 ? '▲' : '▼'} ${Math.abs(monthChange).toFixed(1)}%`}
          delta={`$${lastMonthTotal.toFixed(2)} last month`}
        />
      </div>

      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <div className="dashboard-content">
          <CategoryChart data={categoryData} />
          <RecentExpenses
            expenses={recentExpenses}
            onViewAll={() => onNavigate('expenses')}
          />
        </div>
      )}
    </div>
  );
}

export default Dashboard;
```

### **RecentExpenses.jsx** (Dashboard, read-only)

Shows the latest 5 expenses. No Edit/Delete here — that lives in the Expenses view.

```jsx
function RecentExpenses({ expenses, onViewAll }) {
  return (
    <div className="recent-expenses">
      <div className="recent-header">
        <h3>Recent expenses</h3>
        <button className="btn-link" onClick={onViewAll}>View all →</button>
      </div>

      {expenses.length === 0 ? (
        <p className="empty-state">No expenses yet.</p>
      ) : (
        <table className="expenses-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(expense => (
              <tr key={expense.id}>
                <td>{new Date(expense.date).toLocaleDateString()}</td>
                <td>{expense.categoryName}</td>
                <td>{expense.description || 'N/A'}</td>
                <td className="amount">${expense.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default RecentExpenses;
```

### **SummaryCard.jsx**

```jsx
import '../styles/Dashboard.css';

function SummaryCard({ label, value, delta }) {
  return (
    <div className="summary-card">
      <div className="card-label">{label}</div>
      <div className="card-value">{value}</div>
      {delta && <div className="card-delta">{delta}</div>}
    </div>
  );
}

export default SummaryCard;
```

### **CategoryChart.jsx**

```jsx
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

function CategoryChart({ data }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    // Destroy previous chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.categoryName),
        datasets: [{
          label: 'Amount spent',
          data: data.map(d => d.total),
          backgroundColor: '#2a78d6',
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { beginAtZero: true }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="chart-container">
      <h3>Expenses by category</h3>
      <canvas ref={chartRef}></canvas>
    </div>
  );
}

export default CategoryChart;
```

---

## **5. API Service Layer** (services/api.js)

```javascript
const BASE_URL = 'http://localhost:5000/api';

// Helper function for requests
const fetchJSON = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// Expenses
export const getExpenses = (categoryId = null) => {
  const url = categoryId
    ? `${BASE_URL}/expenses?categoryId=${categoryId}`
    : `${BASE_URL}/expenses`;
  return fetchJSON(url);
};

export const getExpense = (id) => {
  return fetchJSON(`${BASE_URL}/expenses/${id}`);
};

export const createExpense = (data) => {
  return fetchJSON(`${BASE_URL}/expenses`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const updateExpense = (id, data) => {
  return fetchJSON(`${BASE_URL}/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const deleteExpense = (id) => {
  return fetchJSON(`${BASE_URL}/expenses/${id}`, {
    method: 'DELETE'
  });
};

// Categories
export const getCategories = () => {
  return fetchJSON(`${BASE_URL}/categories`);
};

// Summaries
export const getMonthlySummary = (categoryId = null) => {
  const url = categoryId
    ? `${BASE_URL}/expenses/summary/monthly?categoryId=${categoryId}`
    : `${BASE_URL}/expenses/summary/monthly`;
  return fetchJSON(url);
};

export const getCategorySummary = () => {
  return fetchJSON(`${BASE_URL}/expenses/summary/category`);
};
```

---

## **6. CSS Structure**

### **App.css** (Global layout)

```css
:root {
  --primary: #2a78d6;
  --text-primary: #0b0b0b;
  --text-secondary: #898781;
  --bg-light: #f0efec;
  --bg-surface: #faf9f8;
  --border: #e1e0d9;
  --border-radius: 8px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg-light);
  color: var(--text-primary);
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-layout {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 200px;
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
  padding: var(--spacing-md);
  overflow-y: auto;
}

.main-content {
  flex: 1;
  padding: var(--spacing-lg);
}

@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}
```

### **Modal.css** (Forms)

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(42, 120, 214, 0.1);
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
}

.error-message {
  background: #ffe0e0;
  color: #d32f2f;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: var(--spacing-md);
  font-size: 14px;
}
```

### **ExpensesList.css**

```css
.expenses-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.expenses-table th {
  background: var(--bg-surface);
  padding: var(--spacing-md);
  text-align: left;
  font-weight: 600;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
  color: var(--text-secondary);
}

.expenses-table td {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border);
  font-size: 14px;
}

.expenses-table tbody tr:hover {
  background: var(--bg-light);
}

.amount {
  font-weight: 600;
  color: var(--primary);
}

.category-badge {
  display: inline-block;
  background: var(--primary);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 4px 12px;
  font-size: 12px;
  border: none;
  border-radius: 4px;
  background: var(--primary);
  color: white;
  cursor: pointer;
}

.btn-sm:hover {
  opacity: 0.9;
}

.btn-danger {
  background: #d32f2f;
}
```

---

## **7. State Management Patterns**

### **Prop Drilling (simple, works for MVP)**

```jsx
// Parent passes state down to children
<App> 
  → state: selectedCategory, expenses
  → passes to ExpensesList as props
  → ExpensesList passes to ExpenseRow as props
```

### **useCallback to Optimize**

```jsx
const handleDelete = useCallback((id) => {
  setExpenses(prev => prev.filter(e => e.id !== id));
}, []);  // Only created once since dependencies don't change

// Pass to child
<ExpenseRow onDelete={handleDelete} />
```

### **Trigger Re-fetch Pattern**

```jsx
// In parent
const [refreshTrigger, setRefreshTrigger] = useState(0);

const triggerRefresh = () => {
  setRefreshTrigger(prev => prev + 1);  // Change value to trigger
};

// In child ExpenseForm
useEffect(() => {
  fetchExpenses();
}, [refreshTrigger]);  // Re-fetch when this changes
```

---

## **8. Common Patterns**

### **Controlled Form Inputs**

```jsx
const [formData, setFormData] = useState({ name: '', email: '' });

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

return (
  <input
    name="name"
    value={formData.name}
    onChange={handleChange}
  />
);
```

### **Conditional Rendering**

```jsx
{loading && <p>Loading...</p>}
{!loading && error && <p className="error">{error}</p>}
{!loading && !error && expenses.length > 0 && <ExpenseTable... />}
{!loading && !error && expenses.length === 0 && <p>No expenses</p>}
```

### **Event Handler with Parameters**

```jsx
// ❌ Wrong: calls handleDelete immediately
<button onClick={handleDelete(expense.id)}>Delete</button>

// ✅ Correct: calls handleDelete only on click
<button onClick={() => handleDelete(expense.id)}>Delete</button>
```

---

## **9. Running the Frontend**

```bash
# Install dependencies
npm install

# Add chart.js for dashboard
npm install chart.js

# Start dev server
npm run dev

# Build for production
npm run build
```

Dev server: `http://localhost:5173`

---

## **10. Debugging Tips**

### **React DevTools**

- Install React DevTools browser extension
- Inspect component state, props, hooks
- Check component re-render warnings

### **Console Logging**

```jsx
useEffect(() => {
  console.log('selectedCategory changed:', selectedCategory);
  fetchExpenses();
}, [selectedCategory]);
```

### **Network Tab**

- Open DevTools → Network tab
- Monitor fetch calls to backend
- Check response payloads

### **Common Issues**

**Infinite loop in useEffect**:

```jsx
// ❌ Wrong: no dependency array, runs every render
useEffect(() => { fetchExpenses(); });

// ✅ Correct: dependency array
useEffect(() => { fetchExpenses(); }, [selectedCategory]);
```

**Stale state in closures**:

```jsx
// ❌ Wrong: handleDelete sees old expenses array
const handleDelete = (id) => {
  setExpenses(expenses.filter(e => e.id !== id));
};

// ✅ Correct: use callback with dependency
const handleDelete = useCallback((id) => {
  setExpenses(prev => prev.filter(e => e.id !== id));
}, []);
```

---

## **Ready to Code?**

1. Run `npm create vite@latest expense-tracker-frontend -- --template react`
2. Create folder structure (components, services, styles)
3. Build App.jsx with state management
4. Build components one by one
5. Connect to backend API

Let's ship this! 🚀
