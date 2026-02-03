import { useState, useEffect } from 'react'
import AddTransactionModal from '../components/AddTransactionModal'
import Notification from '../components/Notification'
import ConfirmDialog from '../components/ConfirmDialog'
import { useNotification } from '../hooks/useNotification'
import { transactionAPI } from '../services/api'

function TransactionHistory() {
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const { notification, showSuccess, showError, hideNotification } = useNotification()
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    dateFrom: '',
    dateTo: ''
  })

  // Load transactions from backend
  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await transactionAPI.getAll()
      setTransactions(response.data)
      setFilteredTransactions(response.data)
    } catch (err) {
      console.error('Failed to load transactions:', err)
    } finally {
      setLoading(false)
    }
  }

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

  const handleDelete = async (id) => {
    const transaction = transactions.find(t => t._id === id)
    setDeleteConfirm({ id, transaction })
  }

  const confirmDelete = async () => {
    try {
      await transactionAPI.delete(deleteConfirm.id)
      setTransactions(transactions.filter(t => t._id !== deleteConfirm.id))
      showSuccess(
        'Transaction Deleted',
        'The transaction has been successfully removed from your records.',
        3000
      )
    } catch (err) {
      showError(
        'Deletion Failed',
        err.response?.data?.message || 'An error occurred while deleting the transaction. Please try again.',
        4000
      )
    } finally {
      setDeleteConfirm(null)
    }
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleAddOrUpdate = async (transaction) => {
    try {
      if (editingTransaction) {
        // Update existing
        const response = await transactionAPI.update(editingTransaction._id, transaction)
        setTransactions(transactions.map(t =>
          t._id === editingTransaction._id ? response.data : t
        ))
        setEditingTransaction(null)
        showSuccess(
          'Transaction Updated',
          'Your transaction has been successfully updated.',
          3000
        )
      } else {
        // Add new
        const response = await transactionAPI.create(transaction)
        setTransactions([response.data, ...transactions])
        showSuccess(
          'Transaction Created',
          'Your new transaction has been successfully recorded.',
          3000
        )
      }
      setIsModalOpen(false)
    } catch (err) {
      showError(
        'Operation Failed',
        err.response?.data?.message || 'An error occurred while saving the transaction. Please try again.',
        4000
      )
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTransaction(null)
  }

  const categories = [...new Set(transactions.map(t => t.category))]

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-slate-800 text-3xl font-bold">Transaction History</h1>
        <button
          className="btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-700">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="form-label">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="form-select"
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label className="form-label">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="form-select"
            >
              <option value="all">All</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">
            <p className="text-lg">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p className="text-lg">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Receipt</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredTransactions.map(transaction => (
                  <tr key={transaction._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${transaction.type === 'income'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {transaction.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {transaction.description}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${transaction.type === 'income' ? 'text-green-700' : 'text-red-700'
                      }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {transaction.receipt ? (
                        <button
                          onClick={() => setSelectedReceipt(transaction.receipt)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-slate-400">No receipt</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="text-blue-600 hover:text-blue-800 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(transaction._id)}
                        className="text-red-600 hover:text-red-800"
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

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
          onClick={() => setSelectedReceipt(null)}
        >
          <div
            className="bg-white rounded-lg max-w-3xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Receipt</h3>
              <button
                className="text-3xl text-slate-500 hover:text-slate-700 w-8 h-8 flex items-center justify-center"
                onClick={() => setSelectedReceipt(null)}

      {/* Notifications */}
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={hideNotification}
          duration={notification.duration}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete this ${deleteConfirm?.transaction?.type} transaction of $${deleteConfirm?.transaction?.amount}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <img
                src={selectedReceipt}
                alt="Receipt"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionHistory
