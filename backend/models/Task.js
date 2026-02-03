const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
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
    dueDate: {
        type: Date,
        default: null,
    },
    dueTime: {
        type: String,
        default: null, // Format: "HH:MM" (24-hour)
    },
    priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium',
    },
    completed: {
        type: Boolean,
        default: false,
    },
    category: {
        type: String,
        default: 'General',
    },
    sentNotifications: [{
        interval: Number, // Minutes before event (120 for 2 hours, 15 for 15 minutes)
        sentAt: Date,
        emailSent: Boolean,
        telegramSent: Boolean,
    }],
}, {
    timestamps: true,
});

// Index for efficient querying
taskSchema.index({ user: 1, completed: 1 });

module.exports = mongoose.model('Task', taskSchema);
