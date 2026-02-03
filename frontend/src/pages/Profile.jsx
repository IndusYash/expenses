import { useState, useEffect } from 'react'
import { authAPI, telegramAPI } from '../services/api'

function Profile({ onLogout }) {
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [userInfo, setUserInfo] = useState({ name: '', email: '', emailNotifications: true, lastEmailSent: null })
  const [telegramStatus, setTelegramStatus] = useState({ telegramEnabled: false, telegramChatId: null })
  const [chatIdInput, setChatIdInput] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserProfile()
    fetchTelegramStatus()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await authAPI.getMe()
      setUserInfo({
        name: response.data.name,
        email: response.data.email,
        emailNotifications: response.data.emailNotifications ?? true,
        lastEmailSent: response.data.lastEmailSent
      })
      if (response.data.profilePhoto) {
        setProfilePhoto(response.data.profilePhoto)
        setPhotoPreview(response.data.profilePhoto)
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
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

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    if (onLogout) {
      onLogout()
    }
    window.location.href = '/login'
  }

  const handlePhotoUpload = async (e) => {
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
    reader.onload = async (event) => {
      const photoData = event.target.result
      setPhotoPreview(photoData)

      try {
        await authAPI.updateProfile({ profilePhoto: photoData })
        setProfilePhoto(photoData)
        alert('Profile photo updated successfully!')
      } catch (err) {
        alert('Failed to update profile photo: ' + (err.response?.data?.message || err.message))
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = async () => {
    try {
      await authAPI.updateProfile({ profilePhoto: null })
      setProfilePhoto(null)
      setPhotoPreview(null)
      alert('Profile photo removed successfully!')
    } catch (err) {
      alert('Failed to remove profile photo: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleEmailNotificationToggle = async () => {
    try {
      const response = await authAPI.updateEmailPreferences({
        emailNotifications: !userInfo.emailNotifications
      })
      setUserInfo({ ...userInfo, emailNotifications: response.data.emailNotifications })
      alert(response.data.message)
    } catch (err) {
      alert('Failed to update preferences: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleSendTestEmail = async () => {
    try {
      await authAPI.sendTestEmail()
      alert('Test email sent! Check your inbox.')
    } catch (err) {
      alert('Failed to send test email: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleSendSummaryNow = async () => {
    try {
      await authAPI.sendSummaryNow()
      alert('Weekly summary sent! Check your inbox.')
    } catch (err) {
      alert('Failed to send summary: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleLinkTelegram = async () => {
    if (!chatIdInput) {
      alert('Please enter your Telegram Chat ID')
      return
    }
    try {
      const response = await telegramAPI.link({ chatId: parseInt(chatIdInput) })
      setTelegramStatus({ telegramEnabled: true, telegramChatId: parseInt(chatIdInput) })
      setChatIdInput('')
      alert(response.data.message)
      fetchTelegramStatus()
    } catch (err) {
      alert('Failed to link Telegram: ' + (err.response?.data?.message || err.message))
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

  const handleTestTelegram = async () => {
    try {
      const response = await telegramAPI.test()
      alert(response.data.message)
    } catch (err) {
      alert('Failed to send test notification: ' + (err.response?.data?.message || err.message))
    }
  }

  const openTelegramBot = () => {
    const botUsername = 'Wakemeup_mmm_bot'
    window.open(`https://t.me/${botUsername}`, '_blank')
  }

  if (loading) {
    return (
      <div className="w-full max-w-2xl">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl">
      <h1 className="text-slate-800 text-3xl font-bold mb-8">Profile</h1>

      {/* Profile Photo Section */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4 text-slate-700">Profile Photo</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-slate-200"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center border-4 border-slate-300">
                <svg className="w-16 h-16 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <label className="btn-primary cursor-pointer inline-block text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              {profilePhoto ? 'Change Photo' : 'Upload Photo'}
            </label>
            {profilePhoto && (
              <button
                onClick={handleRemovePhoto}
                className="btn-outline"
              >
                Remove Photo
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4 text-slate-700">User Information</h2>
        <div className="space-y-4">
          <div>
            <label className="form-label">Name</label>
            <p className="text-slate-900 text-base">{userInfo.name}</p>
          </div>
          <div>
            <label className="form-label">Email</label>
            <p className="text-slate-900 text-base">{userInfo.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4 text-slate-700">Change Password</h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="form-label">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              className="form-input"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="form-label">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              className="form-input"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label htmlFor="confirmNewPassword" className="form-label">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmNewPassword"
              className="form-input"
              placeholder="Confirm new password"
            />
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => alert('Password change functionality (UI only)')}
          >
            Change Password
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4 text-slate-700">Telegram Notifications</h2>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">Get instant notifications on Telegram!</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Connect your Telegram account to receive real-time notifications for transactions, reminders, and weekly summaries.
                </p>
              </div>
            </div>
          </div>

          {!telegramStatus.telegramEnabled ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-3">How to connect:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">
                  <li>Click the button below to open our Telegram bot</li>
                  <li>Send <code className="px-2 py-1 bg-slate-200 rounded text-xs">/start</code> to the bot</li>
                  <li>Copy the Chat ID provided by the bot</li>
                  <li>Paste it below and click "Link Account"</li>
                </ol>
              </div>

              <button
                onClick={openTelegramBot}
                className="w-full bg-[#0088cc] hover:bg-[#006699] text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.764 8.317c-.132.591-.48.737-.974.459l-2.69-1.98-1.297 1.248c-.144.144-.264.264-.542.264l.191-2.718 4.95-4.474c.216-.191-.047-.298-.336-.107l-6.116 3.853-2.635-.823c-.573-.18-.584-.573.12-.849l10.304-3.97c.479-.18.898.107.742.849z"/>
                </svg>
                Open Telegram Bot
              </button>

              <div>
                <label htmlFor="chatId" className="form-label">
                  Telegram Chat ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="chatId"
                    value={chatIdInput}
                    onChange={(e) => setChatIdInput(e.target.value)}
                    className="form-input flex-1"
                    placeholder="Enter your Chat ID (e.g., 123456789)"
                  />
                  <button
                    onClick={handleLinkTelegram}
                    className="btn-primary whitespace-nowrap"
                  >
                    Link Account
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900">Telegram Connected!</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Chat ID: <code className="px-2 py-1 bg-green-100 rounded text-xs">{telegramStatus.telegramChatId}</code>
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      You'll receive notifications for transactions, reminders, and security alerts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleTestTelegram}
                  className="btn-secondary flex-1"
                >
                  Send Test Notification
                </button>
                <button
                  onClick={handleUnlinkTelegram}
                  className="btn-outline flex-1"
                >
                  Disconnect Telegram
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4 text-slate-700">Email Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-slate-800">Weekly Summary Emails</h3>
              <p className="text-sm text-slate-600 mt-1">
                Receive a weekly summary of your finances every Sunday at 9 AM
              </p>
              {userInfo.lastEmailSent && (
                <p className="text-xs text-slate-500 mt-2">
                  Last sent: {new Date(userInfo.lastEmailSent).toLocaleDateString()}
                </p>
              )}
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={userInfo.emailNotifications}
                onChange={handleEmailNotificationToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSendTestEmail}
              className="btn-secondary flex-1"
            >
              Send Test Email
            </button>
            <button
              onClick={handleSendSummaryNow}
              className="btn-primary flex-1"
            >
              Send Summary Now
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-slate-700">Account Actions</h2>
        <button
          onClick={handleLogout}
          className="btn-danger"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Profile
