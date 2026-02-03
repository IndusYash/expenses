import { useState, useCallback } from 'react'

export function useNotification() {
    const [notification, setNotification] = useState(null)

    const showNotification = useCallback(({ type, title, message, duration }) => {
        setNotification({ type, title, message, duration })
    }, [])

    const hideNotification = useCallback(() => {
        setNotification(null)
    }, [])

    const showSuccess = useCallback((title, message, duration) => {
        showNotification({ type: 'success', title, message, duration })
    }, [showNotification])

    const showError = useCallback((title, message, duration) => {
        showNotification({ type: 'error', title, message, duration })
    }, [showNotification])

    const showWarning = useCallback((title, message, duration) => {
        showNotification({ type: 'warning', title, message, duration })
    }, [showNotification])

    const showInfo = useCallback((title, message, duration) => {
        showNotification({ type: 'info', title, message, duration })
    }, [showNotification])

    return {
        notification,
        showNotification,
        hideNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo
    }
}
