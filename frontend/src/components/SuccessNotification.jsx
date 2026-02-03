import { useEffect } from 'react'

export default function SuccessNotification({ message, onClose, duration = 4000 }) {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose()
            }, duration)
            return () => clearTimeout(timer)
        }
    }, [duration, onClose])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-30 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden animate-slideIn">
                {/* Success Icon */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 flex justify-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-scaleIn">
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                {/* Message Content */}
                <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Merriweather, Georgia, serif' }}>
                        Connection Successful
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Action Button */}
                <div className="px-6 pb-6">
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-3 bg-gray-900 text-white rounded font-medium hover:bg-gray-800 transition-colors"
                    >
                        Continue
                    </button>
                </div>
            </div>

            <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>
        </div>
    )
}
