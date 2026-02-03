import { useState, useEffect } from 'react'
import AddTransactionModal from '../components/AddTransactionModal'

function TransactionHistory() {
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    dateFrom: '',
    dateTo: ''
  })

  useEffect(() => {
    const saved = localStorage.getItem('transactions')
    if (saved) {
      const parsed = JSON.parse(saved)
      setTransactions(parsed)
      setFilteredTransactions(parsed)
    }
  }, [])

  useEffect(() => {
    let filtered = [...transactions]

    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type)
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(t => t.category === filters.category)
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(t => t.date >= filters.dateFrom)
    }

    if (filters.dateTo) {
      filtered = filtered.filter(t => t.date <= filters.dateTo)
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date))

    setFilteredTransactions(filtered)
  }, [transactions, filters])

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      const updated = transactions.filter(t => t.id !== id)
      setTransactions(updated)
      localStorage.setItem('transactions', JSON.stringify(updated))
    }
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleAddOrUpdate = (transaction) => {
    if (editingTransaction) {
      // Update existing
      const updated = transactions.map(t => 
        t.id === editingTransaction.id ? { ...transaction, id: editingTransaction.id } : t
      )
      setTransactions(updated)
      localStorage.setItem('transactions', JSON.stringify(updated))
      setEditingTransaction(null)
    } else {
      // Add new
      const newTransaction = {
        ...transaction,
        id: Date.now(),
        date: transaction.date || new Date().toISOString().slice(0, 10)
      }
      const updated = [newTransaction, ...transactions]
      setTransactions(updated)
      localStorage.setItem('transactions', JSON.stringify(updated))
    }
    setIsModalOpen(false)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTransaction(null)
  }

  const categories = [...new Set(transactions.map(t => t.category))]

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8 md:flex-row flex-col md:items-center items-start gap-4">
        <h1 className="text-gray-800 text-3xl font-bold">Transaction History</h1>
        <button 
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none px-6 py-3 rounded font-semibold text-base hover:shadow-lg hover:-translate-y-0.5 transition-all"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAdd={handleAddOrUpdate}
        editingTransaction={editingTransaction}
      />
    </div>
  )
}

export default TransactionHistory
