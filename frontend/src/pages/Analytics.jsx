import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { transactionAPI } from '../services/api'

export default function Analytics() {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [dateRange, setDateRange] = useState('6months') // 1month, 3months, 6months, 1year

    useEffect(() => {
        fetchTransactions()
    }, [])

    const fetchTransactions = async () => {
        try {
            setLoading(true)
            const response = await transactionAPI.getAll()
            setTransactions(response.data)
        } catch (error) {
            console.error('Error fetching transactions:', error)
        } finally {
            setLoading(false)
        }
    }

    // Filter transactions by date range
    const getFilteredTransactions = () => {
        const now = new Date()
        const months = dateRange === '1month' ? 1 : dateRange === '3months' ? 3 : dateRange === '6months' ? 6 : 12
        const cutoffDate = new Date(now.setMonth(now.getMonth() - months))

        return transactions.filter(t => new Date(t.date) >= cutoffDate)
    }

    // Process data for expense composition pie chart
    const getExpenseComposition = () => {
        const filtered = getFilteredTransactions().filter(t => t.type === 'expense')
        const categoryTotals = {}

        filtered.forEach(t => {
            const category = t.category || 'Uncategorized'
            categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(t.amount)
        })

        return Object.entries(categoryTotals)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
    }

    // Process data for monthly trend
    const getMonthlyTrend = () => {
        const filtered = getFilteredTransactions()
        const monthlyData = {}

        filtered.forEach(t => {
            const date = new Date(t.date)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { month: monthKey, income: 0, expenses: 0 }
            }

            if (t.type === 'income') {
                monthlyData[monthKey].income += t.amount
            } else {
                monthlyData[monthKey].expenses += Math.abs(t.amount)
            }
        })

        return Object.values(monthlyData)
            .sort((a, b) => a.month.localeCompare(b.month))
            .map(d => ({
                ...d,
                month: new Date(d.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
            }))
    }

    // Calculate summary statistics
    const getSummaryStats = () => {
        const filtered = getFilteredTransactions()
        const expenses = filtered.filter(t => t.type === 'expense')
        const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0)
        const avgDaily = totalExpenses / (dateRange === '1month' ? 30 : dateRange === '3months' ? 90 : dateRange === '6months' ? 180 : 365)

        const categoryTotals = {}
        expenses.forEach(t => {
            const category = t.category || 'Uncategorized'
            categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(t.amount)
        })

        const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]

        return {
            totalExpenses,
            avgDaily,
            topCategory: topCategory ? topCategory[0] : 'N/A',
            topCategoryAmount: topCategory ? topCategory[1] : 0
        }
    }

    const expenseData = getExpenseComposition()
    const monthlyData = getMonthlyTrend()
    const stats = getSummaryStats()

    // Chart colors - muted, professional palette
    const COLORS = ['#6b7280', '#9ca3af', '#d1d5db', '#4b5563', '#374151', '#1f2937', '#111827']

    if (loading) {
        return <div className="w-full"><p className="text-gray-600">Loading analytics...</p></div>
    }

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-gray-900 text-3xl font-bold" style={{ fontFamily: 'Merriweather, Georgia, serif' }}>Analytics</h1>

                {/* Date Range Selector */}
                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-500"
                >
                    <option value="1month">Last Month</option>
                    <option value="3months">Last 3 Months</option>
                    <option value="6months">Last 6 Months</option>
                    <option value="1year">Last Year</option>
                </select>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-gray-200 rounded p-6">
                    <p className="text-gray-600 text-sm mb-2">Total Expenses</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.totalExpenses.toFixed(2)}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded p-6">
                    <p className="text-gray-600 text-sm mb-2">Avg Daily Spending</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.avgDaily.toFixed(2)}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded p-6">
                    <p className="text-gray-600 text-sm mb-2">Top Category</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.topCategory}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded p-6">
                    <p className="text-gray-600 text-sm mb-2">Top Category Spend</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.topCategoryAmount.toFixed(2)}</p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Expense Composition Pie Chart */}
                <div className="bg-white border border-gray-200 rounded p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Expense Composition</h2>
                    {expenseData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={expenseData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {expenseData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500 text-center py-12">No expense data available</p>
                    )}
                </div>

                {/* Monthly Trend Bar Chart */}
                <div className="bg-white border border-gray-200 rounded p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h2>
                    {monthlyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                                <Legend />
                                <Bar dataKey="income" fill="#6b7280" name="Income" />
                                <Bar dataKey="expenses" fill="#9ca3af" name="Expenses" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500 text-center py-12">No monthly data available</p>
                    )}
                </div>

                {/* Category Breakdown */}
                <div className="bg-white border border-gray-200 rounded p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h2>
                    {expenseData.length > 0 ? (
                        <div className="space-y-3">
                            {expenseData.slice(0, 5).map((item, index) => {
                                const percentage = (item.value / stats.totalExpenses) * 100
                                return (
                                    <div key={index}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-700">{item.name}</span>
                                            <span className="text-gray-900 font-medium">${item.value.toFixed(2)}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className="bg-gray-600 h-2 rounded-full"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-12">No category data available</p>
                    )}
                </div>

                {/* Income vs Expenses Line Chart */}
                <div className="bg-white border border-gray-200 rounded p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Income vs Expenses</h2>
                    {monthlyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                                <Legend />
                                <Line type="monotone" dataKey="income" stroke="#6b7280" strokeWidth={2} name="Income" />
                                <Line type="monotone" dataKey="expenses" stroke="#9ca3af" strokeWidth={2} name="Expenses" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500 text-center py-12">No trend data available</p>
                    )}
                </div>
            </div>
        </div>
    )
}
