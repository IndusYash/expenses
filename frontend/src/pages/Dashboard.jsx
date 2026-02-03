import { useState, useEffect } from 'react'
import AddTransactionModal from '../components/AddTransactionModal'
import { transactionAPI, telegramAPI } from '../services/api'

function Dashboard() {
  const [transactions, setTransactions] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [telegramStatus, setTelegramStatus] = useState({ telegramEnabled: false, telegramChatId: null })
  const [testingTelegram, setTestingTelegram] = useState(false)
  const [showTelegramSetup, setShowTelegramSetup] = useState(false)

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

  // Load transactions and telegram status from backend
  useEffect(() => {
    fetchTransactions()
    fetchTelegramStatus()
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

  const fetchTelegramStatus = async () => {
    try {
      const response = await telegramAPI.getStatus()
      setTelegramStatus({
        telegramEnabled: response.data.telegramEnabled,
        telegramChatId: response.data.telegramChatId
      })
    } catch (err) {
      console.error('Failed to load Telegram status:', err)
    }
  }

  const handleTestTelegram = async () => {
    try {
      setTestingTelegram(true)
      const response = await telegramAPI.test()
      alert(response.data.message)
    } catch (err) {
      alert('Failed to send test notification: ' + (err.response?.data?.message || err.message))
    } finally {
      setTestingTelegram(false)
    }
  }

  const handleUnlinkTelegram = async () => {
    if (!confirm('Are you sure you want to disconnect your Telegram account?')) {
      return
    }
    try {
      const response = await telegramAPI.unlink()
      setTelegramStatus({ telegramEnabled: false, telegramChatId: null })
      alert(response.data.message)
    } catch (err) {
      alert('Failed to unlink Telegram: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleConnectTelegram = async () => {
    try {
      // Generate token and get deep link
      const response = await telegramAPI.generateToken()
      const { deepLink } = response.data

      // Open Telegram with the deep link
      window.open(deepLink, '_blank')

      // Show setup instructions
      setShowTelegramSetup(true)

      // Poll for connection status every 3 seconds
      const pollInterval = setInterval(async () => {
        const statusResponse = await telegramAPI.getStatus()
        if (statusResponse.data.telegramEnabled) {
          setTelegramStatus({
            telegramEnabled: true,
            telegramChatId: statusResponse.data.telegramChatId
          })
          setShowTelegramSetup(false)
          clearInterval(pollInterval)
          alert('✅ Telegram connected successfully!')
        }
      }, 3000)

      // Stop polling after 10 minutes (token expiry)
      setTimeout(() => clearInterval(pollInterval), 10 * 60 * 1000)
    } catch (err) {
      alert('Failed to generate connection link: ' + (err.response?.data?.message || err.message))
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-slate-800 text-2xl md:text-3xl font-bold">Dashboard</h1>
        <button
          className="btn-primary w-full sm:w-auto"
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

      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <label htmlFor="month" className="font-medium text-slate-600">Select Month:</label>
        <select
          id="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="form-select w-full sm:max-w-xs"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <h3 className="text-slate-500 text-xs font-semibold mb-2 uppercase tracking-wide">Total Income</h3>
            <p className="text-2xl md:text-3xl font-bold text-green-600">${totalIncome.toLocaleString()}</p>
          </div>
          <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <h3 className="text-slate-500 text-xs font-semibold mb-2 uppercase tracking-wide">Total Expense</h3>
            <p className="text-2xl md:text-3xl font-bold text-red-600">${totalExpense.toLocaleString()}</p>
          </div>
          <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 sm:col-span-2 md:col-span-1">
            <h3 className="text-slate-500 text-xs font-semibold mb-2 uppercase tracking-wide">Balance</h3>
            <p className={`text-2xl md:text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${balance.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Telegram Widget with One-Click Setup */}
      <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${telegramStatus.telegramEnabled ? 'bg-green-100' : 'bg-slate-100'}`}>
              <svg className={`w-5 h-5 ${telegramStatus.telegramEnabled ? 'text-green-600' : 'text-slate-400'}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.764 8.317c-.132.591-.48.737-.974.459l-2.69-1.98-1.297 1.248c-.144.144-.264.264-.542.264l.191-2.718 4.95-4.474c.216-.191-.047-.298-.336-.107l-6.116 3.853-2.635-.823c-.573-.18-.584-.573.12-.849l10.304-3.97c.479-.18.898.107.742.849z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Telegram Notifications</h3>
              <p className="text-sm text-slate-500">
                {telegramStatus.telegramEnabled
                  ? `✓ Connected - Chat ID: ${telegramStatus.telegramChatId}`
                  : 'Get instant alerts on your phone'}
              </p>
            </div>
          </div>

          {telegramStatus.telegramEnabled ? (
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleTestTelegram}
                disabled={testingTelegram}
                className="btn-secondary text-sm flex-1 sm:flex-none"
              >
                {testingTelegram ? 'Sending...' : 'Test'}
              </button>
              <button
                onClick={handleUnlinkTelegram}
                className="btn-outline text-sm flex-1 sm:flex-none"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectTelegram}
              className="btn-primary text-sm w-full sm:w-auto"
            >
              Connect Telegram
            </button>
          )}
        </div>

        {/* Waiting for Connection Message */}
        {!telegramStatus.telegramEnabled && showTelegramSetup && (
          <div className="pt-4 border-t border-slate-200 animate-slide-down">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900">Waiting for connection...</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Telegram should have opened in a new tab. Send <code className="px-2 py-1 bg-blue-100 rounded text-xs">/start</code> to the bot to complete the connection.
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    This page will automatically update when you're connected.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
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
