import React, { useState, useEffect, useRef } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { taskAPI, reminderAPI } from '../services/api'

export default function Reminders() {
    const [activeTab, setActiveTab] = useState('tasks')
    const [tasks, setTasks] = useState([])
    const [reminders, setReminders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [showTaskModal, setShowTaskModal] = useState(false)
    const [showReminderModal, setShowReminderModal] = useState(false)
    const [editingTask, setEditingTask] = useState(null)
    const [editingReminder, setEditingReminder] = useState(null)
    const [openMenuDate, setOpenMenuDate] = useState(null) // Track which date menu is open
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
    const clickedDateRef = useRef(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [tasksRes, remindersRes] = await Promise.all([
                taskAPI.getAll(),
                reminderAPI.getAll()
            ])
            setTasks(tasksRes.data)
            setReminders(remindersRes.data)
        } catch (err) {
            console.error('Failed to load data:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleToggleTask = async (id) => {
        try {
            const response = await taskAPI.toggleComplete(id)
            setTasks(tasks.map(t => t._id === id ? response.data : t))
        } catch (err) {
            alert('Failed to update task')
        }
    }

    const handleDeleteTask = async (id) => {
        if (window.confirm('Delete this task?')) {
            try {
                await taskAPI.delete(id)
                setTasks(tasks.filter(t => t._id !== id))
            } catch (err) {
                alert('Failed to delete task')
            }
        }
    }

    const handleDeleteReminder = async (id) => {
        if (window.confirm('Delete this reminder?')) {
            try {
                await reminderAPI.delete(id)
                setReminders(reminders.filter(r => r._id !== id))
            } catch (err) {
                alert('Failed to delete reminder')
            }
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800'
            case 'medium': return 'bg-yellow-100 text-yellow-800'
            case 'low': return 'bg-green-100 text-green-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getTileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateStr = date.toISOString().split('T')[0]
            const dayTasks = tasks.filter(t => t.dueDate && t.dueDate.startsWith(dateStr))
            const dayReminders = reminders.filter(r => r.reminderDate && r.reminderDate.startsWith(dateStr))

            if (dayTasks.length > 0 || dayReminders.length > 0) {
                return (
                    <div className="flex justify-center gap-1 mt-1">
                        {dayTasks.length > 0 && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>}
                        {dayReminders.length > 0 && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>}
                    </div>
                )
            }
        }
        return null
    }

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openMenuDate) {
                // Check if click is on a calendar date button or inside the dropdown
                const isCalendarClick = event.target.closest('.react-calendar__tile')
                const isDropdownClick = event.target.closest('[data-dropdown-menu]')

                if (!isCalendarClick && !isDropdownClick) {
                    setOpenMenuDate(null)
                }
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [openMenuDate])

    if (loading) {
        return <div className="w-full"><p className="text-gray-600">Loading...</p></div>
    }

    return (
        <div className="w-full animate-fade-in">
            <h1 className="text-gray-900 text-3xl font-bold mb-8" style={{ fontFamily: 'Merriweather, Georgia, serif' }}>Reminders & Tasks</h1>

            {/* Tabs */}
            <div className="flex gap-6 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('tasks')}
                    className={`pb-3 font-medium transition-colors relative ${activeTab === 'tasks'
                        ? 'text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Tasks ({tasks.filter(t => !t.completed).length})
                    {activeTab === 'tasks' && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('reminders')}
                    className={`pb-3 font-medium transition-colors relative ${activeTab === 'reminders'
                        ? 'text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Reminders ({reminders.filter(r => !r.completed).length})
                    {activeTab === 'reminders' && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('calendar')}
                    className={`pb-3 font-medium transition-colors relative ${activeTab === 'calendar'
                        ? 'text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Calendar
                    {activeTab === 'calendar' && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></span>
                    )}
                </button>
            </div>

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-slate-700">My Tasks</h2>
                        <button className="btn-primary" onClick={() => setShowTaskModal(true)}>
                            + Add Task
                        </button>
                    </div>

                    <div className="space-y-3">
                        {tasks.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">No tasks yet. Create your first task!</p>
                        ) : (
                            tasks.map(task => (
                                <div
                                    key={task._id}
                                    className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up interactive-lift"
                                >
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            checked={task.completed}
                                            onChange={() => handleToggleTask(task._id)}
                                            className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div className="flex-1">
                                            <h3 className={`font - semibold text - slate - 800 ${task.completed ? 'line-through text-slate-400' : ''} `}>
                                                {task.title}
                                            </h3>
                                            {task.description && (
                                                <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                                            )}
                                            <div className="flex gap-2 mt-2">
                                                <span className={`text - xs px - 2 py - 1 rounded ${getPriorityColor(task.priority)} `}>
                                                    {task.priority}
                                                </span>
                                                {task.dueDate && (
                                                    <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">
                                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                                        {task.dueTime && ` at ${task.dueTime} `}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteTask(task._id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Reminders Tab */}
            {activeTab === 'reminders' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-slate-700">My Reminders</h2>
                        <button className="btn-primary" onClick={() => setShowReminderModal(true)}>
                            + Add Reminder
                        </button>
                    </div>

                    <div className="space-y-3">
                        {reminders.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">No reminders yet. Create your first reminder!</p>
                        ) : (
                            reminders.map(reminder => (
                                <div
                                    key={reminder._id}
                                    className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up interactive-lift"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="text-2xl">🔔</div>
                                        <div className="flex-1">
                                            <h3 className={`font - semibold text - slate - 800 ${reminder.completed ? 'line-through text-slate-400' : ''} `}>
                                                {reminder.title}
                                            </h3>
                                            {reminder.description && (
                                                <p className="text-sm text-slate-600 mt-1">{reminder.description}</p>
                                            )}
                                            <div className="flex gap-2 mt-2 flex-wrap">
                                                <span className={`text - xs px - 2 py - 1 rounded ${getPriorityColor(reminder.priority)} `}>
                                                    {reminder.priority}
                                                </span>
                                                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                                                    {reminder.category}
                                                </span>
                                                <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">
                                                    {new Date(reminder.reminderDate).toLocaleDateString()} at {reminder.eventTime || reminder.reminderTime}
                                                </span>
                                                {reminder.recurring !== 'none' && (
                                                    <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
                                                        🔁 {reminder.recurring}
                                                    </span>
                                                )}
                                                {reminder.notificationIntervals && reminder.notificationIntervals.length > 0 && (
                                                    <span className="text-xs px-2 py-1 rounded bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                                                        📧 {reminder.notificationIntervals.map(interval => {
                                                            const hours = Math.floor(interval / 60);
                                                            const mins = interval % 60;
                                                            if (hours > 0) return hours === 1 ? '1h' : `${hours} h`;
                                                            return `${mins} m`;
                                                        }).join(', ')} before
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteReminder(reminder._id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Calendar</h2>

                    {/* Calendar Container */}
                    <div
                        className="bg-white rounded border border-gray-200 p-6 overflow-visible"
                    >
                        <div className="overflow-visible">
                            <Calendar
                                onChange={setSelectedDate}
                                value={selectedDate}
                                className="w-full border-0"
                                tileContent={({ date, view }) => {
                                    if (view !== 'month') return null

                                    const dateStr = date.toISOString().split('T')[0]
                                    const dayTasks = tasks.filter(t => t.dueDate?.startsWith(dateStr))
                                    const dayReminders = reminders.filter(r => r.reminderDate?.startsWith(dateStr))
                                    const isOpen = openMenuDate === dateStr

                                    return (
                                        <div className="relative pt-1">
                                            {/* Indicator Dots */}
                                            {(dayTasks.length > 0 || dayReminders.length > 0) && (
                                                <div className="flex justify-center gap-1">
                                                    {dayTasks.length > 0 && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                                                    {dayReminders.length > 0 && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />}
                                                </div>
                                            )}

                                            {/* Dropdown Menu */}
                                            {isOpen && (
                                                <div
                                                    data-dropdown-menu
                                                    className="fixed bg-white rounded border border-gray-200 shadow-lg py-1 whitespace-nowrap min-w-[140px]"
                                                    style={{
                                                        zIndex: 99999,
                                                        left: `${menuPosition.x}px`,
                                                        top: `${menuPosition.y}px`,
                                                        transform: 'translateX(-50%)'
                                                    }}
                                                >
                                                    <div
                                                        role="button"
                                                        tabIndex={0}
                                                        onMouseDown={(e) => {
                                                            e.preventDefault()
                                                            e.stopPropagation()
                                                            setSelectedDate(date)
                                                            setShowTaskModal(true)
                                                            setOpenMenuDate(null)
                                                        }}
                                                        className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors cursor-pointer text-gray-700"
                                                    >
                                                        Add Task
                                                    </div>
                                                    <div
                                                        role="button"
                                                        tabIndex={0}
                                                        onMouseDown={(e) => {
                                                            e.preventDefault()
                                                            e.stopPropagation()
                                                            setSelectedDate(date)
                                                            setShowReminderModal(true)
                                                            setOpenMenuDate(null)
                                                        }}
                                                        className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors cursor-pointer text-gray-700"
                                                    >
                                                        Add Reminder
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                }}
                                onClickDay={(date, event) => {
                                    event.stopPropagation()
                                    const dateStr = date.toISOString().split('T')[0]

                                    // Get the position of the clicked date tile
                                    const target = event.target.closest('button')
                                    if (target) {
                                        const rect = target.getBoundingClientRect()
                                        setMenuPosition({
                                            x: rect.left + rect.width / 2,
                                            y: rect.bottom + 5
                                        })
                                    }

                                    setOpenMenuDate(openMenuDate === dateStr ? null : dateStr)
                                }}
                            />
                        </div>

                        {/* Legend */}
                        <div className="mt-6 flex gap-6 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                                <span>Tasks</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
                                <span>Reminders</span>
                            </div>
                        </div>
                    </div>

                    {/* Selected Date Items */}
                    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">
                            {selectedDate.toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </h3>

                        {/* Tasks for Selected Date */}
                        <div className="space-y-3">
                            {tasks
                                .filter(t => t.dueDate?.startsWith(selectedDate.toISOString().split('T')[0]))
                                .map(task => (
                                    <div
                                        key={task._id}
                                        className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-3">
                                                <span className="text-xl">📝</span>
                                                <div>
                                                    <p className="font-medium text-slate-800">{task.title}</p>
                                                    {task.dueTime && (
                                                        <p className="text-sm text-slate-600 mt-1">
                                                            🕐 {task.dueTime}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`text - xs px - 2 py - 1 rounded ${getPriorityColor(task.priority)} `}>
                                                {task.priority}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                            {/* Reminders for Selected Date */}
                            {reminders
                                .filter(r => r.reminderDate?.startsWith(selectedDate.toISOString().split('T')[0]))
                                .map(reminder => (
                                    <div
                                        key={reminder._id}
                                        className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-3">
                                                <span className="text-xl">🔔</span>
                                                <div>
                                                    <p className="font-medium text-slate-800">{reminder.title}</p>
                                                    <p className="text-sm text-slate-600 mt-1">
                                                        🕐 {reminder.eventTime || reminder.reminderTime}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`text - xs px - 2 py - 1 rounded ${getPriorityColor(reminder.priority)} `}>
                                                {reminder.priority}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                            {/* Empty State */}
                            {tasks.filter(t => t.dueDate?.startsWith(selectedDate.toISOString().split('T')[0])).length === 0 &&
                                reminders.filter(r => r.reminderDate?.startsWith(selectedDate.toISOString().split('T')[0])).length === 0 && (
                                    <div className="text-center py-8 text-slate-400">
                                        <p>No items for this date</p>
                                        <p className="text-sm mt-2">Click on a date in the calendar to add items</p>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            )}

            {/* Simple Task Modal - will create proper modal component later */}
            {showTaskModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full animate-slide-down shadow-xl">
                        <h3 className="text-xl font-bold mb-4 text-slate-800">Add Task</h3>
                        <form onSubmit={async (e) => {
                            e.preventDefault()
                            const formData = new FormData(e.target)
                            try {
                                const response = await taskAPI.create({
                                    title: formData.get('title'),
                                    description: formData.get('description'),
                                    dueDate: formData.get('dueDate') || null,
                                    dueTime: formData.get('dueTime') || null,
                                    priority: formData.get('priority'),
                                    category: formData.get('category')
                                })
                                setTasks([response.data, ...tasks])
                                setShowTaskModal(false)
                            } catch (err) {
                                alert('Failed to create task')
                            }
                        }}>
                            <input name="title" placeholder="Task title" required className="form-input mb-3" />
                            <textarea name="description" placeholder="Description" className="form-input mb-3" rows="3"></textarea>

                            <div className="mb-3">
                                <label className="form-label">Due Date & Time</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        name="dueDate"
                                        type="date"
                                        className="form-input"
                                        defaultValue={selectedDate.toISOString().split('T')[0]}
                                    />
                                    <input name="dueTime" type="time" className="form-input" placeholder="Time" />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    ⏰ You'll receive reminders 2 hours and 15 minutes before
                                </p>
                            </div>

                            <select name="priority" className="form-select mb-3">
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                                <option value="low">Low Priority</option>
                            </select>
                            <input name="category" placeholder="Category" className="form-input mb-4" />
                            <div className="flex gap-2">
                                <button type="submit" className="btn-primary flex-1 interactive-lift">Create</button>
                                <button type="button" onClick={() => setShowTaskModal(false)} className="btn-outline flex-1">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Simple Reminder Modal */}
            {showReminderModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full animate-slide-down shadow-xl">
                        <h3 className="text-xl font-bold mb-4 text-slate-800">Add Reminder</h3>
                        <form onSubmit={async (e) => {
                            e.preventDefault()
                            const formData = new FormData(e.target)

                            // Build notification intervals array
                            const intervals = []
                            if (formData.get('notify6h')) intervals.push(360)
                            if (formData.get('notify1h')) intervals.push(60)
                            const customInterval = formData.get('customInterval')
                            if (customInterval && parseInt(customInterval) > 0) {
                                intervals.push(parseInt(customInterval))
                            }

                            try {
                                const response = await reminderAPI.create({
                                    title: formData.get('title'),
                                    description: formData.get('description'),
                                    reminderDate: formData.get('reminderDate'),
                                    reminderTime: formData.get('reminderTime'),
                                    eventTime: formData.get('eventTime') || formData.get('reminderTime'),
                                    category: formData.get('category'),
                                    priority: formData.get('priority'),
                                    recurring: formData.get('recurring'),
                                    notificationIntervals: intervals.length > 0 ? intervals : [360, 60]
                                })
                                setReminders([response.data, ...reminders])
                                setShowReminderModal(false)
                            } catch (err) {
                                alert('Failed to create reminder')
                            }
                        }}>
                            <input name="title" placeholder="Reminder title" required className="form-input mb-3" />
                            <textarea name="description" placeholder="Description" className="form-input mb-3" rows="3"></textarea>

                            <div className="mb-3">
                                <label className="form-label">Event Date & Time</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        name="reminderDate"
                                        type="date"
                                        required
                                        className="form-input"
                                        defaultValue={selectedDate.toISOString().split('T')[0]}
                                    />
                                    <input name="eventTime" type="time" required className="form-input" placeholder="Event time" />
                                </div>
                            </div>

                            {/* Notification Preferences */}
                            <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                                <label className="form-label text-blue-900">📧 Email Notifications</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:text-slate-900 transition-colors">
                                        <input type="checkbox" name="notify6h" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                                        <span>6 hours before event</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:text-slate-900 transition-colors">
                                        <input type="checkbox" name="notify1h" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                                        <span>1 hour before event</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            name="customInterval"
                                            placeholder="Custom (minutes)"
                                            min="1"
                                            className="form-input text-sm py-2"
                                        />
                                        <span className="text-xs text-slate-500">min before</span>
                                    </div>
                                </div>
                            </div>
                            <select name="category" className="form-select mb-3">
                                <option value="Other">Other</option>
                                <option value="Bill Payment">Bill Payment</option>
                                <option value="Meeting">Meeting</option>
                                <option value="Goal">Goal</option>
                            </select>
                            <select name="priority" className="form-select mb-3">
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                                <option value="low">Low Priority</option>
                            </select>
                            <select name="recurring" className="form-select mb-4">
                                <option value="none">No Repeat</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                            <div className="flex gap-2">
                                <button type="submit" className="btn-primary flex-1 interactive-lift">Create</button>
                                <button type="button" onClick={() => setShowReminderModal(false)} className="btn-outline flex-1">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
