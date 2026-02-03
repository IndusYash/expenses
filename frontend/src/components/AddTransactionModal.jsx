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
    description: '',
    receipt: null
  })
  const [receiptPreview, setReceiptPreview] = useState(null)

  // Update form when editing
  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        type: editingTransaction.type,
        category: editingTransaction.category,
        amount: editingTransaction.amount.toString(),
        date: editingTransaction.date,
        description: editingTransaction.description,
        receipt: editingTransaction.receipt || null
      })
      setReceiptPreview(editingTransaction.receipt || null)
    } else {
      setFormData({
        type: 'expense',
        category: '',
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        description: '',
        receipt: null
      })
      setReceiptPreview(null)
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

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload only image files')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const receiptData = event.target.result
      setFormData({ ...formData, receipt: receiptData })
      setReceiptPreview(receiptData)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveReceipt = () => {
    setFormData({ ...formData, receipt: null })
    setReceiptPreview(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.category || !formData.amount || !formData.description) {
      alert('Please fill in all required fields')
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
      description: '',
      receipt: null
    })
    setReceiptPreview(null)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-slate-800 text-2xl font-bold m-0">
            {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            className="bg-transparent border-none text-3xl text-slate-500 cursor-pointer p-0 w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 transition-colors"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-5">
            <label htmlFor="type" className="form-label">Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="mb-5">
            <label htmlFor="category" className="form-label">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select a category</option>
              {categories[formData.type].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="mb-5">
            <label htmlFor="amount" className="form-label">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="form-input"
              required
            />
          </div>

          <div className="mb-5">
            <label htmlFor="date" className="form-label">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="mb-5">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
              rows="3"
              className="form-input resize-y"
              required
            />
          </div>

          {/* Receipt Upload */}
          <div className="mb-5">
            <label className="form-label">Receipt (Optional)</label>
            {receiptPreview ? (
              <div className="space-y-3">
                <img
                  src={receiptPreview}
                  alt="Receipt preview"
                  className="w-full h-40 object-contain bg-slate-50 rounded border border-slate-200"
                />
                <button
                  type="button"
                  onClick={handleRemoveReceipt}
                  className="w-full px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors text-sm font-medium"
                >
                  Remove Receipt
                </button>
              </div>
            ) : (
              <label className="block w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded text-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  className="hidden"
                />
                <svg className="mx-auto h-8 w-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm text-slate-600">Click to upload receipt</span>
              </label>
            )}
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-md font-medium cursor-pointer hover:bg-slate-300 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
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
