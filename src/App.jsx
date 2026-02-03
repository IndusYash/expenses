import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import TransactionHistory from './pages/TransactionHistory'
import Reports from './pages/Reports'
import Profile from './pages/Profile'
import Layout from './components/Layout'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in (dummy check)
    const auth = localStorage.getItem('isAuthenticated')
    setIsAuthenticated(auth === 'true')
    setLoading(false)
  }, [])

  const handleLogin = (userData) => {
    setIsAuthenticated(true)
    localStorage.setItem('isAuthenticated', 'true')
    if (userData) {
      localStorage.setItem('userName', userData.name || '')
      localStorage.setItem('userEmail', userData.email || '')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('isAuthenticated')
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/signup" 
          element={!isAuthenticated ? <Signup onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/transactions" element={<TransactionHistory />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/profile" element={<Profile onLogout={handleLogout} />} />
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  )
}

export default App
