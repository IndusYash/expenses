import { useState, useEffect } from 'react'

function Receipts() {
    const [receipts, setReceipts] = useState([])
    const [isUploading, setIsUploading] = useState(false)
    const [selectedReceipt, setSelectedReceipt] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterDate, setFilterDate] = useState('')

    // Load receipts from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('receipts')
        if (saved) {
            setReceipts(JSON.parse(saved))
        }
    }, [])

    // Save receipts to localStorage
    useEffect(() => {
        if (receipts.length > 0) {
            localStorage.setItem('receipts', JSON.stringify(receipts))
        }
    }, [receipts])

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files)

        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                alert('Please upload only image files')
                continue
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('File size should be less than 5MB')
                continue
            }

            const reader = new FileReader()
            reader.onload = (event) => {
                const newReceipt = {
                    id: Date.now() + Math.random(),
                    image: event.target.result,
                    fileName: file.name,
                    date: new Date().toISOString().slice(0, 10),
                    description: '',
                    amount: '',
                    uploadedAt: new Date().toISOString()
                }
                setReceipts(prev => [newReceipt, ...prev])
            }
            reader.readAsDataURL(file)
        }
    }

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this receipt?')) {
            const updated = receipts.filter(r => r.id !== id)
            setReceipts(updated)
            localStorage.setItem('receipts', JSON.stringify(updated))
            if (selectedReceipt?.id === id) {
                setSelectedReceipt(null)
            }
        }
    }

    const handleUpdateMetadata = (id, field, value) => {
        const updated = receipts.map(r =>
            r.id === id ? { ...r, [field]: value } : r
        )
        setReceipts(updated)
    }

    const handleDownload = (receipt) => {
        const link = document.createElement('a')
        link.href = receipt.image
        link.download = receipt.fileName || 'receipt.jpg'
        link.click()
    }

    // Filter receipts
    const filteredReceipts = receipts.filter(receipt => {
        const matchesSearch = receipt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            receipt.fileName.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesDate = !filterDate || receipt.date === filterDate
        return matchesSearch && matchesDate
    })

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-gray-800 text-3xl font-bold">Receipts</h1>
                <label className="btn-primary cursor-pointer">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    + Upload Receipt
                </label>
            </div>

            {/* Search and Filter */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="form-label">Search</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by description or filename..."
                            className="form-input"
                        />
                    </div>
                    <div>
                        <label className="form-label">Filter by Date</label>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="form-input"
                        />
                    </div>
                </div>
            </div>

            {/* Receipts Grid */}
            {filteredReceipts.length === 0 ? (
                <div className="bg-white p-12 rounded-lg border border-slate-200 shadow-sm text-center">
                    <svg className="mx-auto h-12 w-12 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p className="text-slate-500 text-lg">No receipts uploaded yet</p>
                    <p className="text-slate-400 text-sm mt-2">Upload your first receipt to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReceipts.map(receipt => (
                        <div key={receipt.id} className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                            <div
                                className="h-48 bg-slate-100 cursor-pointer overflow-hidden"
                                onClick={() => setSelectedReceipt(receipt)}
                            >
                                <img
                                    src={receipt.image}
                                    alt={receipt.fileName}
                                    className="w-full h-full object-contain hover:scale-105 transition-transform"
                                />
                            </div>
                            <div className="p-4">
                                <div className="mb-3">
                                    <label className="text-xs font-medium text-slate-500 mb-1 block">Description</label>
                                    <input
                                        type="text"
                                        value={receipt.description}
                                        onChange={(e) => handleUpdateMetadata(receipt.id, 'description', e.target.value)}
                                        placeholder="Add description..."
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 mb-1 block">Date</label>
                                        <input
                                            type="date"
                                            value={receipt.date}
                                            onChange={(e) => handleUpdateMetadata(receipt.id, 'date', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 mb-1 block">Amount</label>
                                        <input
                                            type="number"
                                            value={receipt.amount}
                                            onChange={(e) => handleUpdateMetadata(receipt.id, 'amount', e.target.value)}
                                            placeholder="0.00"
                                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedReceipt(receipt)}
                                        className="flex-1 px-3 py-2 text-sm bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => handleDownload(receipt)}
                                        className="flex-1 px-3 py-2 text-sm border border-slate-300 text-slate-700 rounded hover:bg-slate-50 transition-colors"
                                    >
                                        Download
                                    </button>
                                    <button
                                        onClick={() => handleDelete(receipt.id)}
                                        className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Receipt Modal */}
            {selectedReceipt && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
                    onClick={() => setSelectedReceipt(null)}
                >
                    <div
                        className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-4 border-b border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-800">
                                {selectedReceipt.description || selectedReceipt.fileName}
                            </h3>
                            <button
                                className="text-3xl text-slate-500 hover:text-slate-700 w-8 h-8 flex items-center justify-center"
                                onClick={() => setSelectedReceipt(null)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-4">
                            <img
                                src={selectedReceipt.image}
                                alt={selectedReceipt.fileName}
                                className="w-full h-auto"
                            />
                        </div>
                        <div className="p-4 border-t border-slate-200 bg-slate-50">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-slate-600">Date:</span>
                                    <span className="ml-2 text-slate-800">{new Date(selectedReceipt.date).toLocaleDateString()}</span>
                                </div>
                                {selectedReceipt.amount && (
                                    <div>
                                        <span className="font-medium text-slate-600">Amount:</span>
                                        <span className="ml-2 text-slate-800">${selectedReceipt.amount}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Receipts
