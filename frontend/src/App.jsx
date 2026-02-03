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
          element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="/signup" 
          element={!isAuthenticated ? <Signup onLogin={handleLogin} /> : <Navigate to="/dashboard" replace />} 
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/transactions"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <TransactionHistory />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/reports"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Reports />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/profile"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Profile onLogout={handleLogout} />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </Router>
  )
}

export default App
