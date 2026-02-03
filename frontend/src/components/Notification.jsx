import { useEffect } from 'react'

export default function Notification({ type = 'success', title, message, onClose, duration = 4000 }) {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose()
            }, duration)
            return () => clearTimeout(timer)
        }
    }, [duration, onClose])

    const styles = {
        success: {
            bg: 'from-emerald-50 to-green-50',
            iconBg: 'bg-green-500',
            border: 'border-green-200',
            iconColor: 'text-green-600',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
            )
        },
        error: {
            bg: 'from-red-50 to-rose-50',
            iconBg: 'bg-red-500',
            border: 'border-red-200',
            iconColor: 'text-red-600',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            )
        },
        warning: {
            bg: 'from-amber-50 to-yellow-50',
            iconBg: 'bg-amber-500',
            border: 'border-amber-200',
            iconColor: 'text-amber-600',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            )
        },
        info: {
            bg: 'from-blue-50 to-indigo-50',
            iconBg: 'bg-blue-500',
            border: 'border-blue-200',
            iconColor: 'text-blue-600',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    }

    const style = styles[type] || styles.info

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pointer-events-none">
            <div className="pointer-events-auto mt-6 w-full max-w-md">
                <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-slideDown">
                    {/* Header with icon */}
                    <div className={`bg-gradient-to-r ${style.bg} px-6 py-4 flex items-center gap-4 border-b ${style.border}`}>
                        <div className={`${style.iconBg} rounded-full p-2 text-white flex-shrink-0 shadow-lg`}>
                            {style.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {title}
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Close notification"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Message content */}
                    <div className="px-6 py-4 bg-white">
                        <p className="text-gray-700 text-sm leading-relaxed">
                            {message}
                        </p>
                    </div>

                    {/* Progress bar */}
                    {duration && (
                        <div className="h-1 bg-gray-100">
                            <div 
                                className={`h-full ${style.iconBg} animate-progress`}
                                style={{ animationDuration: `${duration}ms` }}
                            />
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-100px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes progress {
                    from {
                        width: 100%;
                    }
                    to {
                        width: 0%;
                    }
                }

                .animate-slideDown {
                    animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .animate-progress {
                    animation: progress linear;
                }
            `}</style>
        </div>
    )
}
