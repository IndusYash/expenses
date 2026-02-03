import { useState, useEffect } from 'react'
import AddTransactionModal from '../components/AddTransactionModal'
import { transactionAPI } from '../services/api'

function Dashboard() {
  const [transactions, setTransactions] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  // Load transactions from backend
  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await transactionAPI.getAll()
      setTransactions(response.data)
      setError('')
    } catch (err) {
      setError('Failed to load transactions')
      console.error(err)
    } finally {
      setLoading(false)
    }
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

  const handleAddTransaction = async (transaction) => {
    try {
      const response = await transactionAPI.create(transaction)
      setTransactions([response.data, ...transactions])
      setIsModalOpen(false)
    } catch (err) {
      alert('Failed to add transaction: ' + (err.response?.data?.message || err.message))
    }
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-slate-800 text-3xl font-bold">Dashboard</h1>
        <button
          className="btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Transaction
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200 mb-4">
          {error}
        </div>
      )}

      <div className="mb-6 flex items-center gap-4">
        <label htmlFor="month" className="font-medium text-slate-600">Select Month:</label>
        <select
          id="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="form-select max-w-xs"
        >
          {getMonths().map(month => (
            <option key={month} value={month}>
              {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-slate-600">Loading transactions...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <h3 className="text-slate-500 text-xs font-semibold mb-2 uppercase tracking-wide">Total Income</h3>
            <p className="text-3xl font-bold text-green-600">${totalIncome.toLocaleString()}</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <h3 className="text-slate-500 text-xs font-semibold mb-2 uppercase tracking-wide">Total Expense</h3>
            <p className="text-3xl font-bold text-red-600">${totalExpense.toLocaleString()}</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <h3 className="text-slate-500 text-xs font-semibold mb-2 uppercase tracking-wide">Balance</h3>
            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${balance.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTransaction}
      />
    </div>
  )
}

export default Dashboard
