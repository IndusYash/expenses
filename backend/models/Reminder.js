const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Please add a title'],
    },
    description: {
        type: String,
        default: '',
    },
    reminderDate: {
        type: Date,
        required: [true, 'Please add a reminder date'],
    },
    reminderTime: {
        type: String,
        required: [true, 'Please add a reminder time'],
    },
    category: {
        type: String,
        enum: ['Bill Payment', 'Meeting', 'Goal', 'Other'],
        default: 'Other',
    },
    recurring: {
        type: String,
        enum: ['none', 'daily', 'weekly', 'monthly'],
        default: 'none',
    },
    emailSent: {
        type: Boolean,
        default: false,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium',
    },
    eventTime: {
        type: String,
        required: false, // Optional for backward compatibility
        default: '',
    },
    notificationIntervals: {
        type: [Number], // Array of minutes before event to send notifications
        default: [360, 120, 10, 0], // Default: 6 hours, 2 hours, 10 minutes before, and at event time
    },
    sentNotifications: [{
        interval: Number, // Which interval was sent (in minutes)
        sentAt: Date,
        emailSent: Boolean,
        telegramSent: Boolean,
    }],
}, {
    timestamps: true,
});

// Index for efficient querying
reminderSchema.index({ user: 1, reminderDate: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
