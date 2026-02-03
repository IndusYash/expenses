const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendTelegramMessage } = require('../services/telegramService');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            // Send security notification via Telegram if enabled
            if (user.telegramEnabled && user.telegramChatId) {
                const loginTime = new Date().toLocaleString();
                const message = `🔐 <b>Security Alert</b>\n\n` +
                    `New login to your Finance Tracker account\n` +
                    `Time: ${loginTime}\n\n` +
                    `If this wasn't you, please change your password immediately.`;
                await sendTelegramMessage(user.telegramChatId, message);
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                profilePhoto: user.profilePhoto,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePhoto: user.profilePhoto,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.profilePhoto = req.body.profilePhoto || user.profilePhoto;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                profilePhoto: updatedUser.profilePhoto,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update email notification preferences
// @route   PUT /api/auth/email-preferences
// @access  Private
const updateEmailPreferences = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.emailNotifications = req.body.emailNotifications;
            const updatedUser = await user.save();

            res.json({
                emailNotifications: updatedUser.emailNotifications,
                message: `Email notifications ${updatedUser.emailNotifications ? 'enabled' : 'disabled'}`,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send test email
// @route   POST /api/auth/send-test-email
// @access  Private
const sendTestEmail = async (req, res) => {
    try {
        const { sendTestEmail } = require('../services/emailService');
        const sent = await sendTestEmail(req.user.email);

        if (sent) {
            res.json({ message: 'Test email sent successfully' });
        } else {
            res.status(500).json({ message: 'Failed to send test email' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send weekly summary now
// @route   POST /api/auth/send-summary
// @access  Private
const sendSummaryNow = async (req, res) => {
    try {
        const { sendWeeklySummary } = require('../services/emailService');
        const Transaction = require('../models/Transaction');

        const transactions = await Transaction.find({ user: req.user._id });
        const sent = await sendWeeklySummary(req.user, transactions);

        if (sent) {
            // Update last email sent
            req.user.lastEmailSent = new Date();
            await req.user.save();

            res.json({ message: 'Weekly summary sent successfully' });
        } else {
            res.status(500).json({ message: 'Failed to send summary' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide current and new password' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const user = await User.findById(req.user._id).select('+password');

        // Verify current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Send security notification via Telegram if enabled
        if (user.telegramEnabled && user.telegramChatId) {
            const changeTime = new Date().toLocaleString();
            const message = `🔐 <b>Security Alert</b>\n\n` +
                `Your Finance Tracker password was changed\n` +
                `Time: ${changeTime}\n\n` +
                `If you didn't make this change, please contact support immediately.`;
            await sendTelegramMessage(user.telegramChatId, message);
        }

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    register, 
    login, 
    getMe, 
    updateProfile, 
    updateEmailPreferences, 
    sendTestEmail, 
    sendSummaryNow,
    changePassword 
};
