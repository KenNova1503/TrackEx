# Expense Tracker — Root Context

**Project**: Expense Tracker Portfolio App  
**Tech Stack**: React 19 (JSX) + ASP.NET Core 10 + SQL Server  

---

## **Quick Navigation**

- **Backend work?** See `/backend/ExTrack/Extrack.API/claude.md`
- **Frontend work?** See `/frontend/claude.md`
- **Database schema?** See below
- **API endpoints?** See below
- **Design theme?** See Dashboard Design section

---

## **1. MVP Scope (What We're Building)**

✅ **Core Features**:

- Add expense (amount, category, date, description)
- View expenses in a list with category filtering
- Edit an expense (update all fields)
- Delete an expense
- Dashboard: total spent, breakdown by category, monthly summary

❌ **Out of Scope for MVP** (add later):

- User authentication
- Budget limits/alerts
- Recurring expenses
- Charts/graphs
- Multi-user support

---

## **2. Database Schema (SQL Server)**

### **Categories Table**

```sql
CREATE TABLE Categories (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(500) NOT NULL,
    Color NVARCHAR(7) DEFAULT '#007BFF'
);
```

**Seed Categories**:

1. Food & Dining
2. Transportation
3. Utilities
4. Entertainment
5. Shopping
6. Healthcare
7. Housing
8. Insurance
9. Education
10. Subscriptions
11. Travel
12. Work-Related
13. Gifts & Donations
14. Debt Payments
15. Miscellaneous

### **Expenses Table**

```sql
CREATE TABLE Expenses (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Amount DECIMAL(10,2) NOT NULL,
    Description NVARCHAR(500),
    Date DATETIME NOT NULL,
    CategoryId INT NOT NULL FOREIGN KEY REFERENCES Categories(Id),
    CreatedAt DATETIME DEFAULT GETDATE()
);
```

**Key Design Decisions**:

- ✅ DECIMAL(10,2) for money (NEVER float for currency)
- ✅ Description is OPTIONAL (sometimes category is enough context)
- ✅ Date field for filtering by period
- ✅ Categories normalized separately (avoid duplication)

---

## **3. Data Transfer Objects (DTOs)**

### **ExpenseDto** (response from API)

```csharp
{
  "id": 1,
  "amount": 45.50,
  "description": "Lunch with team",
  "date": "2026-09-24T12:00:00",
  "categoryId": 2,
  "categoryName": "Food & Dining"
}
```

### **CreateExpenseRequest** (POST /api/expenses)

```csharp
{
  "amount": 45.50,
  "description": "Lunch with team",
  "date": "2026-09-24T12:00:00",
  "categoryId": 2
}
```

### **UpdateExpenseRequest** (PUT /api/expenses/{id})

```csharp
{
  "amount": 45.50,
  "description": "Lunch with team",
  "date": "2026-09-24T12:00:00",
  "categoryId": 2
}
```

### **CategoryDto**

```csharp
{
  "id": 2,
  "name": "Food & Dining",
  "description": "Groceries, restaurants, coffee",
  "color": "#007BFF"
}
```

### **MonthlySummaryDto**

```csharp
{
  "month": 9,
  "year": 2026,
  "total": 1245.50
}
```

### **CategorySummaryDto**

```csharp
{
  "categoryName": "Food & Dining",
  "total": 385.20,
  "count": 8
}
```

---

## **4. API Endpoints (Full Spec)**

### **Expenses**

```
GET    /api/expenses                    → Get all expenses
GET    /api/expenses?categoryId=2       → Get expenses filtered by category
GET    /api/expenses/{id}               → Get single expense
POST   /api/expenses                    → Create new expense
PUT    /api/expenses/{id}               → Update expense
DELETE /api/expenses/{id}               → Delete expense
```

### **Categories**

```
GET    /api/categories                  → Get all categories
```

### **Summaries**

```
GET    /api/expenses/summary/monthly    → Get monthly totals (all or by filter)
GET    /api/expenses/summary/category   → Get totals by category
```

**Note**: All endpoints return JSON. Frontend uses Fetch API with POST/PUT payloads.

---

## **5. Component Architecture & App Layout**

### **Layout Structure**

```
┌─────────────────────────────────────────┐
│          Header (Logo, Nav)             │
├─────┬───────────────────────────────────┤
│     │                                   │
│ Left│         Main Content              │
│ Side│       (Dashboard or List)         │
│ bar │                                   │
│     │                                   │
│ Cat │  ┌─────────────────────────────┐ │
│ egory│  │  ADD EXPENSE Button        │ │
│ Filt │  └─────────────────────────────┘ │
│ er  │                                   │
│     │  ┌──────────────────────────────┐ │
│     │  │ ExpensesList / ExpenseTable  │ │
│     │  │ (shows rows, edit/delete)    │ │
│     │  └──────────────────────────────┘ │
│     │                                   │
└─────┴───────────────────────────────────┘
```

### **Component Tree**

```
App.jsx (holds selectedCategory state)
├── Header.jsx
├── Sidebar.jsx
│   └── CategoryFilter.jsx
│       └── Category button list (with click handlers)
└── MainContent.jsx
    ├── Dashboard.jsx (summary cards + chart)
    │   ├── SummaryCard.jsx (×4)
    │   └── CategoryChart.jsx (bar chart via Chart.js)
    │
    └── ExpensesList.jsx (main list view)
        ├── AddExpenseButton.jsx
        ├── ExpenseTable.jsx
        │   └── ExpenseRow.jsx (×N items)
        │       ├── Edit button → opens modal
        │       └── Delete button
        │
        └── ExpenseForm.jsx (modal, reused for Add & Edit)
            ├── AmountInput.jsx
            ├── CategorySelect.jsx (dropdown)
            ├── DatePicker.jsx
            ├── DescriptionTextarea.jsx
            ├── SaveButton.jsx
            └── CancelButton.jsx
```

---

## **6. Dashboard Design & Theme**

### **Visual Theme**

**Color Palette**:

- **Primary Accent**: Blue `#2a78d6` (professional, financial)
- **Backgrounds**: Light grays `#f0efec` / `#faf9f8` (clean)
- **Borders**: Hairline `0.5px` in `#e1e0d9` (subtle)
- **Text**: Dark `#0b0b0b` on light / light `#f0efec` on dark
- **Muted text**: `#898781` (secondary info)
- **Dark mode**: Automatically adapts to system preference

**Typography**:

- **Font**: System font stack (no web fonts, keep it simple)
- **Summary cards**: 24px font-weight 500 (prominent)
- **Labels**: 13px muted gray
- **Borders**: 8px border-radius on cards
- **Padding**: Generous whitespace (1.25rem sections, 16px cards)

### **Dashboard Layout**

1. **Summary Cards Row** (4 KPIs):
   
   - Total spent this month
   - Number of expenses
   - Top category
   - Budget remaining

2. **Two-Column Content**:
   
   - **Left**: Horizontal bar chart (expense breakdown by category)
   - **Right**: Recent expenses table (date, category, description, amount)

3. **Responsive**: Stacks on mobile (≤900px), side-by-side on desktop

---

## **7. Data Flow: User Actions**

### **User Adds an Expense**

1. Clicks "Add Expense" button
2. Modal opens with empty ExpenseForm
3. Fills: Amount, Category (dropdown), Date, Description
4. Clicks Save
5. **POST** `/api/expenses` with JSON payload
6. API returns new expense with ID
7. React state updates: `setExpenses([...expenses, newExpense])`
8. Modal closes, list re-renders with new entry

### **User Edits an Expense**

1. Clicks "Edit" on expense row
2. Modal opens with ExpenseForm pre-filled
3. Modifies fields
4. Clicks Save
5. **PUT** `/api/expenses/{id}` with updated payload
6. API returns updated expense
7. React state updates: `setExpenses(expenses.map(e => e.id === id ? updated : e))`
8. Modal closes, row updates immediately
9. Dashboard cards recalculate totals

### **User Filters by Category**

1. Clicks category in sidebar (e.g., "Food (8)")
2. Button highlights (selected state)
3. `setSelectedCategory(categoryId)` called
4. ExpensesList's `useEffect` detects change
5. Calls `/api/expenses?categoryId=2`
6. Backend filters via LINQ, returns only those expenses
7. React state updates: `setExpenses(filtered)`
8. List re-renders showing only Food expenses
9. Dashboard totals update to reflect Food category only
10. Click "All Expenses" to reset filter

---

## **8. Project Folder Structure**

```
expense-tracker/
├── .gitignore
├── README.md
├── claude.md                          ← You are here
│
├── backend/
│   ├── claude.md                      ← Backend-specific guidance
│   ├── ExpenseTracker.API/
│   │   ├── Controllers/
│   │   │   └── ExpensesController.cs
│   │   ├── Models/
│   │   │   ├── Expense.cs
│   │   │   └── Category.cs
│   │   ├── Data/
│   │   │   ├── AppDbContext.cs
│   │   │   └── Migrations/
│   │   ├── Services/
│   │   │   └── ExpenseService.cs
│   │   ├── DTOs/
│   │   │   ├── ExpenseDto.cs
│   │   │   ├── CreateExpenseRequest.cs
│   │   │   ├── UpdateExpenseRequest.cs
│   │   │   └── CategoryDto.cs
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   └── ExpenseTracker.API.csproj
│   │
│   └── ExpenseTracker.sln
│
└── frontend/
    ├── claude.md                      ← Frontend-specific guidance
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── CategoryFilter.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── SummaryCard.jsx
    │   │   ├── CategoryChart.jsx
    │   │   ├── ExpensesList.jsx
    │   │   ├── ExpenseTable.jsx
    │   │   ├── ExpenseRow.jsx
    │   │   ├── ExpenseForm.jsx
    │   │   └── Layout.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── styles/
    │   │   ├── App.css
    │   │   ├── Dashboard.css
    │   │   ├── ExpensesList.css
    │   │   └── Modal.css
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.html
    ├── package.json
    ├── .gitignore
    └── vite.config.js
```

---

## **9. Key Design Decisions**

| Decision                              | Why                                                                  |
| ------------------------------------- | -------------------------------------------------------------------- |
| **React Hooks over Class Components** | Modern, simpler, less boilerplate. Production standard.              |
| **Plain React/JSX (no TypeScript)**   | Learn React patterns first; add TS after MVP is stable.              |
| **DECIMAL(10,2) for money**           | Never use float for currency (rounding errors).                      |
| **Separate Categories table**         | Normalization: enables filtering, aggregation, no duplication.       |
| **DTOs (Data Transfer Objects)**      | Don't expose DB models directly. Control API contracts.              |
| **useEffect dependencies**            | Prevent infinite loops. Dependency array is crucial.                 |
| **Optimistic updates**                | Delete from state immediately; UI feels fast. Rollback on error.     |
| **Fetch API**                         | Native, no dependencies. Simple for this MVP.                        |
| **Basic CSS only**                    | Learn fundamentals before Tailwind/Bootstrap. Keep it simple.        |
| **Modal for Add/Edit**                | Single reusable form component (empty for Add, pre-filled for Edit). |

---

## **10. Running Postman Tests**

Backend tests go here. Frontend uses browser DevTools.

### **Setup Postman**

1. Create collection: "Expense Tracker"
2. Env variable: `{{BASE_URL}}` = `http://localhost:5000` (or your port)

### **Requests to Test**

- GET `/api/categories` — Verify all categories loaded
- POST `/api/expenses` — Create test expense
- GET `/api/expenses` — Verify it appears
- PUT `/api/expenses/{id}` — Verify update
- DELETE `/api/expenses/{id}` — Verify deletion
- GET `/api/expenses/summary/category` — Verify aggregation

---

## **11. Git Strategy**

```
master (stable releases)
  └── develop (integration branch)
      ├── feature/backend-api (C# work)
      └── feature/frontend-ui (React work)
```

**Commit message format**:

```
[backend/frontend] <component>: <what you did>

Examples:
[backend] ExpensesController: Add POST endpoint with validation
[frontend] ExpenseForm: Add date picker component
```
