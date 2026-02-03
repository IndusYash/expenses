import { Link, useLocation } from 'react-router-dom'

function Layout({ children, onLogout }) {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 flex justify-between items-center shadow-lg md:flex-row flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold m-0">💰 Finance Tracker</h2>
        </div>
        <div className="flex gap-8 items-center flex-wrap justify-center">
          <Link 
            to="/dashboard" 
            className={`px-4 py-2 rounded transition-colors font-medium ${
              isActive('/dashboard') 
                ? 'bg-white bg-opacity-30' 
                : 'hover:bg-white hover:bg-opacity-20'
            }`}
          >
            Dashboard
          </Link>
          <Link 
            to="/transactions" 
            className={`px-4 py-2 rounded transition-colors font-medium ${
              isActive('/transactions') 
                ? 'bg-white bg-opacity-30' 
                : 'hover:bg-white hover:bg-opacity-20'
            }`}
          >
            Transactions
          </Link>
          <Link 
            to="/reports" 
            className={`px-4 py-2 rounded transition-colors font-medium ${
              isActive('/reports') 
                ? 'bg-white bg-opacity-30' 
                : 'hover:bg-white hover:bg-opacity-20'
            }`}
          >
            Reports
          </Link>
          <Link 
            to="/profile" 
            className={`px-4 py-2 rounded transition-colors font-medium ${
              isActive('/profile') 
                ? 'bg-white bg-opacity-30' 
                : 'hover:bg-white hover:bg-opacity-20'
            }`}
          >
            Profile
          </Link>
        </div>
      </nav>
      <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  )
}

export default Layout
