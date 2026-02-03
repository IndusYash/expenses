import { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { reminderAPI, taskAPI } from '../services/api'

function Reminders() {
    const [activeTab, setActiveTab] = useState('tasks')
    const [tasks, setTasks] = useState([])
    const [reminders, setReminders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [showTaskModal, setShowTaskModal] = useState(false)
    const [showReminderModal, setShowReminderModal] = useState(false)
    const [editingTask, setEditingTask] = useState(null)
    const [editingReminder, setEditingReminder] = useState(null)

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

    if (loading) {
        return <div className="w-full"><p className="text-gray-600">Loading...</p></div>
    }

    return (
        <div className="w-full animate-fade-in">
            <h1 className="text-slate-800 text-3xl font-bold mb-8 animate-slide-up">Reminders & To-Do</h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('tasks')}
                    className={`px-6 py-3 font-medium transition-colors ${activeTab === 'tasks'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-600 hover:text-slate-800'
                        }`}
                >
                    📝 To-Do List ({tasks.filter(t => !t.completed).length})
                </button>
                <button
                    onClick={() => setActiveTab('reminders')}
                    className={`px-6 py-3 font-medium transition-colors ${activeTab === 'reminders'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-600 hover:text-slate-800'
                        }`}
                >
                    🔔 Reminders ({reminders.filter(r => !r.completed).length})
                </button>
                <button
                    onClick={() => setActiveTab('calendar')}
                    className={`px-6 py-3 font-medium transition-colors ${activeTab === 'calendar'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-600 hover:text-slate-800'
                        }`}
                >
                    📅 Calendar
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
                                            <h3 className={`font-semibold text-slate-800 ${task.completed ? 'line-through text-slate-400' : ''}`}>
                                                {task.title}
                                            </h3>
                                            {task.description && (
                                                <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                                            )}
                                            <div className="flex gap-2 mt-2">
                                                <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                                                    {task.priority}
                                                </span>
                                                {task.dueDate && (
                                                    <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">
                                                        Due: {new Date(task.dueDate).toLocaleDateString()}
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
                                            <h3 className={`font-semibold text-slate-800 ${reminder.completed ? 'line-through text-slate-400' : ''}`}>
                                                {reminder.title}
                                            </h3>
                                            {reminder.description && (
                                                <p className="text-sm text-slate-600 mt-1">{reminder.description}</p>
                                            )}
                                            <div className="flex gap-2 mt-2 flex-wrap">
                                                <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(reminder.priority)}`}>
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
                                                            if (hours > 0) return hours === 1 ? '1h' : `${hours}h`;
                                                            return `${mins}m`;
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
                <div>
                    <h2 className="text-xl font-semibold text-slate-700 mb-4">Calendar View</h2>
                    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                        <Calendar
                            onChange={setSelectedDate}
                            value={selectedDate}
                            tileContent={getTileContent}
                            className="w-full border-none"
                        />
                        <div className="mt-6 flex gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="text-slate-600">Tasks</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                <span className="text-slate-600">Reminders</span>
                            </div>
                        </div>
                    </div>

                    {/* Items for selected date */}
                    <div className="mt-6">
                        <h3 className="font-semibold text-slate-700 mb-3">
                            Items for {selectedDate.toLocaleDateString()}
                        </h3>
                        <div className="space-y-2">
                            {tasks.filter(t => t.dueDate && t.dueDate.startsWith(selectedDate.toISOString().split('T')[0])).map(task => (
                                <div key={task._id} className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                                    <p className="font-medium text-blue-900">📝 {task.title}</p>
                                </div>
                            ))}
                            {reminders.filter(r => r.reminderDate && r.reminderDate.startsWith(selectedDate.toISOString().split('T')[0])).map(reminder => (
                                <div key={reminder._id} className="bg-orange-50 p-3 rounded border-l-4 border-orange-500">
                                    <p className="font-medium text-orange-900">🔔 {reminder.title} - {reminder.reminderTime}</p>
                                </div>
                            ))}
                            {tasks.filter(t => t.dueDate && t.dueDate.startsWith(selectedDate.toISOString().split('T')[0])).length === 0 &&
                                reminders.filter(r => r.reminderDate && r.reminderDate.startsWith(selectedDate.toISOString().split('T')[0])).length === 0 && (
                                    <p className="text-slate-500 text-center py-4">No items for this date</p>
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
                            <input name="dueDate" type="date" className="form-input mb-3" />
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
                                    <input name="reminderDate" type="date" required className="form-input" />
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

export default Reminders
