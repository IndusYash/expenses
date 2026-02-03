import { useState, useEffect } from 'react'

const categories = {
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
  expense: ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Health', 'Education', 'Other']
}

function AddTransactionModal({ isOpen, onClose, onAdd, editingTransaction }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    description: ''
  })

  // Update form when editing
  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        type: editingTransaction.type,
        category: editingTransaction.category,
        amount: editingTransaction.amount.toString(),
        date: editingTransaction.date,
        description: editingTransaction.description
      })
    } else {
      setFormData({
        type: 'expense',
        category: '',
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        description: ''
      })
    }
  }, [editingTransaction, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
      // Reset category when type changes
      ...(name === 'type' && { category: '' })
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.category || !formData.amount || !formData.description) {
      alert('Please fill in all fields')
      return
    }

    onAdd({
      ...formData,
      amount: parseFloat(formData.amount)
    })

    // Reset form
    setFormData({
      type: 'expense',
      category: '',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      description: ''
    })
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-gray-800 text-2xl font-bold m-0">
            {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button 
            className="bg-transparent border-none text-3xl text-gray-500 cursor-pointer p-0 w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="type" className="block mb-2 text-gray-600 font-medium">Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-3 border-2 border-gray-200 rounded text-base focus:outline-none focus:border-indigo-500"
              required
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="category" className="block mb-2 text-gray-600 font-medium">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-3 border-2 border-gray-200 rounded text-base focus:outline-none focus:border-indigo-500"
              required
            >
              <option value="">Select a category</option>
              {categories[formData.type].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="amount" className="block mb-2 text-gray-600 font-medium">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-3 py-3 border-2 border-gray-200 rounded text-base focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="date" className="block mb-2 text-gray-600 font-medium">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-3 border-2 border-gray-200 rounded text-base focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block mb-2 text-gray-600 font-medium">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
              rows="3"
              className="w-full px-3 py-3 border-2 border-gray-200 rounded text-base resize-y focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="flex gap-4 justify-end mt-8">
            <button 
              type="button" 
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded font-semibold text-base cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded font-semibold text-base cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddTransactionModal
