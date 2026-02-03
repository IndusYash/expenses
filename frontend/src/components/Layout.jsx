import { Link, useLocation } from 'react-router-dom'

function Layout({ children, onLogout }) {
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h2 className="text-xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                💼 Finance Tracker
              </h2>
            </div>
            <div className="flex gap-1">
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${isActive('/dashboard')
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                Dashboard
              </Link>
              <Link
                to="/transactions"
                className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${isActive('/transactions')
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                Transactions
              </Link>
              <Link
                to="/receipts"
                className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${isActive('/receipts')
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                Receipts
              </Link>
              <Link
                to="/reminders"
                className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${isActive('/reminders')
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                Reminders
              </Link>
              <Link
                to="/profile"
                className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${isActive('/profile')
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                Profile
              </Link>
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}

export default Layout
