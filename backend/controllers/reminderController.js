const Reminder = require('../models/Reminder');
const User = require('../models/User');
const { sendTelegramMessage, formatNotificationMessage } = require('../services/telegramService');

// @desc    Get all reminders
// @route   GET /api/reminders
// @access  Private
const getReminders = async (req, res) => {
    try {
        const reminders = await Reminder.find({ user: req.user._id }).sort({ reminderDate: 1 });
        res.json(reminders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create reminder
// @route   POST /api/reminders
// @access  Private
const createReminder = async (req, res) => {
    try {
        const reminder = await Reminder.create({
            user: req.user._id,
            ...req.body,
        });

        // Send immediate acknowledgment notification
        const user = await User.findById(req.user._id);
        if (user.telegramEnabled && user.telegramChatId) {
            const eventTimeStr = reminder.eventTime || reminder.reminderTime;
            const message = formatNotificationMessage('reminder_created', {
                title: reminder.title,
                description: reminder.description,
                date: reminder.reminderDate,
                time: eventTimeStr,
                intervals: reminder.notificationIntervals,
            });
            await sendTelegramMessage(user.telegramChatId, message);
        }

        res.status(201).json(reminder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update reminder
// @route   PUT /api/reminders/:id
// @access  Private
const updateReminder = async (req, res) => {
    try {
        const reminder = await Reminder.findById(req.params.id);

        if (!reminder) {
            return res.status(404).json({ message: 'Reminder not found' });
        }

        if (reminder.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedReminder = await Reminder.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedReminder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete reminder
// @route   DELETE /api/reminders/:id
// @access  Private
const deleteReminder = async (req, res) => {
    try {
        const reminder = await Reminder.findById(req.params.id);

        if (!reminder) {
            return res.status(404).json({ message: 'Reminder not found' });
        }

        if (reminder.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await reminder.deleteOne();
        res.json({ message: 'Reminder deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark reminder as complete
// @route   PUT /api/reminders/:id/complete
// @access  Private
const markComplete = async (req, res) => {
    try {
        const reminder = await Reminder.findById(req.params.id);

        if (!reminder) {
            return res.status(404).json({ message: 'Reminder not found' });
        }

        if (reminder.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        reminder.completed = !reminder.completed;
        await reminder.save();

        res.json(reminder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getReminders,
    createReminder,
    updateReminder,
    deleteReminder,
    markComplete,
};
