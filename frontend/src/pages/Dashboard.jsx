import { useState, useEffect } from 'react'
import AddTransactionModal from '../components/AddTransactionModal'

// Dummy data
const dummyTransactions = [
  { id: 1, type: 'income', category: 'Salary', amount: 5000, date: '2024-01-15', description: 'Monthly salary' },
  { id: 2, type: 'expense', category: 'Food', amount: 150, date: '2024-01-16', description: 'Groceries' },
  { id: 3, type: 'expense', category: 'Transport', amount: 50, date: '2024-01-17', description: 'Bus fare' },
  { id: 4, type: 'income', category: 'Freelance', amount: 800, date: '2024-01-18', description: 'Project payment' },
  { id: 5, type: 'expense', category: 'Entertainment', amount: 100, date: '2024-01-19', description: 'Movie tickets' },
]

function Dashboard() {
  const [transactions, setTransactions] = useState(dummyTransactions)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Get months for dropdown
  const getMonths = () => {
    const months = []
    const currentDate = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      months.push(date.toISOString().slice(0, 7))
    }
    return months
  }

  // Filter transactions by selected month
  const filteredTransactions = transactions.filter(t => t.date.startsWith(selectedMonth))

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  const handleAddTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now(),
      date: transaction.date || new Date().toISOString().slice(0, 10)
    }
    setTransactions([newTransaction, ...transactions])
    setIsModalOpen(false)
  }

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('transactions')
    if (saved) {
      setTransactions(JSON.parse(saved))
    }
  }, [])

  // Save to localStorage when transactions change
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions))
  }, [transactions])

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8 md:flex-row flex-col md:items-center items-start gap-4">
        <h1 className="text-gray-800 text-3xl font-bold">Dashboard</h1>
        <button 
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none px-6 py-3 rounded font-semibold text-base hover:shadow-lg hover:-translate-y-0.5 transition-all"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Transaction
        </button>
      </div>

      <div className="mb-8 flex items-center gap-4">
        <label htmlFor="month" className="font-medium text-gray-600">Select Month:</label>
        <select 
          id="month" 
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border-2 border-gray-200 rounded text-base bg-white cursor-pointer focus:outline-none focus:border-indigo-500"
        >
          {getMonths().map(month => (
            <option key={month} value={month}>
              {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all">
          <h3 className="text-gray-500 text-sm font-medium mb-2 uppercase tracking-wide">Total Income</h3>
          <p className="text-3xl font-bold text-green-500">${totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all">
          <h3 className="text-gray-500 text-sm font-medium mb-2 uppercase tracking-wide">Total Expense</h3>
          <p className="text-3xl font-bold text-red-500">${totalExpense.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all">
          <h3 className="text-gray-500 text-sm font-medium mb-2 uppercase tracking-wide">Balance</h3>
          <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${balance.toLocaleString()}
          </p>
        </div>
      </div>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTransaction}
      />
    </div>
  )
}

export default Dashboard
