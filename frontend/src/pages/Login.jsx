import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Dummy validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    // Dummy login - just proceed
    onLogin({ email: formData.email })
    // Navigate to dashboard after successful login
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-indigo-500 to-purple-600 p-8">
      <div className="bg-white p-10 rounded-lg shadow-2xl w-full max-w-md">
        <h1 className="text-center mb-8 text-gray-800 text-3xl font-bold">Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="email" className="block mb-2 text-gray-600 font-medium">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-3 py-3 border-2 border-gray-200 rounded focus:outline-none focus:border-indigo-500 text-base"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block mb-2 text-gray-600 font-medium">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-3 py-3 border-2 border-gray-200 rounded focus:outline-none focus:border-indigo-500 text-base"
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 px-3 py-3 rounded mb-4 text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded font-semibold text-base hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Don't have an account? <Link to="/signup" className="text-indigo-600 font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
