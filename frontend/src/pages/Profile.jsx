function Profile({ onLogout }) {
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    if (onLogout) {
      onLogout()
    }
    window.location.href = '/login'
  }

  // Get user info from localStorage (dummy data)
  const userInfo = {
    name: localStorage.getItem('userName') || 'User',
    email: localStorage.getItem('userEmail') || 'user@example.com'
  }

  return (
    <div className="w-full max-w-2xl">
      <h1 className="text-gray-800 text-3xl font-bold mb-8">Profile</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">User Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
            <p className="text-gray-900 text-base">{userInfo.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <p className="text-gray-900 text-base">{userInfo.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Change Password</h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block mb-2 text-sm font-medium text-gray-600">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              className="w-full px-3 py-3 border-2 border-gray-200 rounded focus:outline-none focus:border-indigo-500 text-base"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-gray-600">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              className="w-full px-3 py-3 border-2 border-gray-200 rounded focus:outline-none focus:border-indigo-500 text-base"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label htmlFor="confirmNewPassword" className="block mb-2 text-sm font-medium text-gray-600">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmNewPassword"
              className="w-full px-3 py-3 border-2 border-gray-200 rounded focus:outline-none focus:border-indigo-500 text-base"
              placeholder="Confirm new password"
            />
          </div>
          <button
            type="button"
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded font-semibold text-base hover:shadow-lg hover:-translate-y-0.5 transition-all"
            onClick={() => alert('Password change functionality (UI only)')}
          >
            Change Password
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Account Actions</h2>
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-red-500 text-white rounded font-semibold text-base hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Profile
