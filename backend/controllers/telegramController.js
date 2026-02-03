const User = require('../models/User');
const { sendTelegramMessage, formatNotificationMessage } = require('../services/telegramService');

/**
 * Handle incoming Telegram webhook updates
 */
const handleWebhook = async (req, res) => {
    try {
        const update = req.body;

        // Handle message updates
        if (update.message) {
            const chatId = update.message.chat.id;
            const text = update.message.text;
            const username = update.message.from.username;
            const firstName = update.message.from.first_name;

            console.log(`Telegram message from ${username || firstName} (${chatId}): ${text}`);

            // Handle /start command with optional token
            if (text && text.startsWith('/start')) {
                // Extract token from command (format: /start TOKEN)
                const parts = text.split(' ');
                const token = parts.length > 1 ? parts[1] : null;

                // Check if chat ID is already linked to a user
                const existingUser = await User.findOne({ telegramChatId: chatId });

                if (existingUser) {
                    await sendTelegramMessage(
                        chatId,
                        `✅ Your Telegram is already connected to Finance Tracker!\n\n` +
                        `Account: ${existingUser.name} (${existingUser.email})\n\n` +
                        `You're all set to receive notifications.`
                    );
                } else if (token) {
                    // Token-based linking
                    const user = await User.findOne({
                        telegramLinkToken: token,
                        telegramLinkTokenExpiry: { $gt: new Date() }
                    });

                    if (user) {
                        // Link the account
                        user.telegramChatId = chatId;
                        user.telegramEnabled = true;
                        user.telegramLinkToken = null;
                        user.telegramLinkTokenExpiry = null;
                        await user.save();

                        // Send success message
                        const welcomeMessage = formatNotificationMessage('welcome', {});
                        await sendTelegramMessage(chatId, welcomeMessage);
                    } else {
                        // Invalid or expired token
                        await sendTelegramMessage(
                            chatId,
                            `❌ <b>Link Failed</b>\n\n` +
                            `This link has expired or is invalid.\n\n` +
                            `Please generate a new link from your Finance Tracker Dashboard.`
                        );
                    }
                } else {
                    // No token provided - show manual instructions
                    await sendTelegramMessage(
                        chatId,
                        `👋 <b>Welcome to Finance Tracker!</b>\n\n` +
                        `To connect your account, please use the "Connect Telegram" button on your Dashboard.\n\n` +
                        `This will generate a secure link that automatically connects your account.`
                    );
                }
            }
        }

        res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Telegram webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};

/**
 * Link Telegram account to user
 */
const linkTelegramAccount = async (req, res) => {
    try {
        const userId = req.user._id;
        const { chatId } = req.body;

        if (!chatId) {
            return res.status(400).json({ error: 'Chat ID is required' });
        }

        // Check if chat ID is already linked to another user
        const existingUser = await User.findOne({
            telegramChatId: chatId,
            _id: { $ne: userId }
        });

        if (existingUser) {
            return res.status(400).json({
                error: 'This Telegram account is already linked to another user'
            });
        }

        // Update user with Telegram info
        const user = await User.findById(userId);
        user.telegramChatId = chatId;
        user.telegramEnabled = true;
        await user.save();

        // Send confirmation message
        const welcomeMessage = formatNotificationMessage('welcome', {});
        await sendTelegramMessage(chatId, welcomeMessage);

        res.json({
            success: true,
            message: 'Telegram account linked successfully',
            telegramEnabled: true,
        });
    } catch (error) {
        console.error('Error linking Telegram account:', error);
        res.status(500).json({ error: 'Failed to link Telegram account' });
    }
};

/**
 * Unlink Telegram account
 */
const unlinkTelegramAccount = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);

        if (user.telegramChatId) {
            await sendTelegramMessage(
                user.telegramChatId,
                '👋 Your Telegram account has been disconnected from Finance Tracker.\n\n' +
                'You will no longer receive notifications.'
            );
        }

        user.telegramChatId = null;
        user.telegramEnabled = false;
        await user.save();

        res.json({
            success: true,
            message: 'Telegram account unlinked successfully',
        });
    } catch (error) {
        console.error('Error unlinking Telegram account:', error);
        res.status(500).json({ error: 'Failed to unlink Telegram account' });
    }
};

/**
 * Get Telegram connection status
 */
const getTelegramStatus = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        res.json({
            telegramEnabled: user.telegramEnabled || false,
            telegramChatId: user.telegramChatId || null,
        });
    } catch (error) {
        console.error('Error getting Telegram status:', error);
        res.status(500).json({ error: 'Failed to get Telegram status' });
    }
};

/**
 * Test Telegram notification
 */
const testTelegramNotification = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user.telegramEnabled || !user.telegramChatId) {
            return res.status(400).json({
                error: 'Telegram is not connected'
            });
        }

        const testMessage = '🧪 <b>Test Notification</b>\n\n' +
            'This is a test message from Finance Tracker.\n' +
            'Your Telegram notifications are working correctly! ✅';

        const sent = await sendTelegramMessage(user.telegramChatId, testMessage);

        if (sent) {
            res.json({
                success: true,
                message: 'Test notification sent successfully'
            });
        } else {
            console.error('sendTelegramMessage returned false for chatId:', user.telegramChatId);
            res.status(500).json({
                error: 'Failed to send test notification'
            });
        }
    } catch (error) {
        console.error('Error sending test notification:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: 'Failed to send test notification' });
    }
};

/**
 * Generate a link token for Telegram account linking
 */
const generateLinkToken = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        // Generate a random token
        const crypto = require('crypto');
        const token = crypto.randomBytes(32).toString('hex');

        // Set token expiry to 10 minutes from now
        const expiry = new Date(Date.now() + 10 * 60 * 1000);

        // Save token to user
        user.telegramLinkToken = token;
        user.telegramLinkTokenExpiry = expiry;
        await user.save();

        // Generate deep link URL
        const botUsername = 'Wakemeup_mmm_bot';
        const deepLink = `https://t.me/${botUsername}?start=${token}`;

        res.json({
            success: true,
            token,
            deepLink,
            expiresAt: expiry
        });
    } catch (error) {
        console.error('Error generating link token:', error);
        res.status(500).json({ error: 'Failed to generate link token' });
    }
};

module.exports = {
    handleWebhook,
    linkTelegramAccount,
    unlinkTelegramAccount,
    getTelegramStatus,
    testTelegramNotification,
    generateLinkToken,
};
