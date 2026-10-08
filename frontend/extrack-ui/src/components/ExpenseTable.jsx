import ExpenseRow from './ExpenseRow'

function ExpenseTable({ expenses, onEdit, onDelete }) {
  return (
    // Wrapper scrolls sideways on narrow screens instead of squeezing the columns
    <div className="table-wrapper">
      <table className="expenses-table">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Category</th>
            <th scope="col">Description</th>
            <th scope="col" className="amount">Amount</th>
            <th scope="col" className="actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map(expense => (
            <ExpenseRow key={expense.id} expense={expense} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ExpenseTable
