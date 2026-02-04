const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

/**
 * Send a message to a Telegram user
 * @param {number} chatId - The Telegram chat ID
 * @param {string} message - The message to send
 * @param {object} options - Additional options (parse_mode, etc.)
 * @returns {Promise<boolean>} - Success status
 */
const sendTelegramMessage = async (chatId, message, options = {}) => {
    try {
        if (!TELEGRAM_BOT_TOKEN) {
            console.warn('Telegram bot token not configured');
            return false;
        }

        if (!chatId) {
            console.warn('No Telegram chat ID provided');
            return false;
        }

        const payload = {
            chat_id: chatId,
            text: message,
            parse_mode: options.parse_mode || 'HTML',
            ...options,
        };

        const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, payload);

        if (response.data.ok) {
            console.log(`Telegram message sent to chat ID ${chatId}`);
            return true;
        } else {
            console.error('Telegram API error:', response.data);
            return false;
        }
    } catch (error) {
        console.error('Error sending Telegram message:', error.response?.data || error.message);
        // If message was sent but there's a minor error, still return true
        if (error.response?.data?.ok) {
            return true;
        }
        return false;
    }
};

/**
 * Set webhook for Telegram bot
 * @param {string} webhookUrl - The webhook URL
 * @returns {Promise<boolean>} - Success status
 */
const setTelegramWebhook = async (webhookUrl) => {
    try {
        if (!TELEGRAM_BOT_TOKEN) {
            console.error('Telegram bot token not configured');
            return false;
        }

        const response = await axios.post(`${TELEGRAM_API_URL}/setWebhook`, {
            url: webhookUrl,
            allowed_updates: ['message'],
        });

        if (response.data.ok) {
            console.log('Telegram webhook set successfully:', webhookUrl);
            return true;
        } else {
            console.error('Failed to set webhook:', response.data);
            return false;
        }
    } catch (error) {
        console.error('Error setting Telegram webhook:', error.message);
        return false;
    }
};

/**
 * Get webhook info
 * @returns {Promise<object|null>} - Webhook info
 */
const getWebhookInfo = async () => {
    try {
        const response = await axios.get(`${TELEGRAM_API_URL}/getWebhookInfo`);
        return response.data.result;
    } catch (error) {
        console.error('Error getting webhook info:', error.message);
        return null;
    }
};

/**
 * Delete webhook
 * @returns {Promise<boolean>} - Success status
 */
const deleteWebhook = async () => {
    try {
        const response = await axios.post(`${TELEGRAM_API_URL}/deleteWebhook`);
        return response.data.ok;
    } catch (error) {
        console.error('Error deleting webhook:', error.message);
        return false;
    }
};

/**
 * Format notification message with emojis and formatting
 * @param {string} type - Notification type
 * @param {object} data - Notification data
 * @returns {string} - Formatted message
 */
const formatNotificationMessage = (type, data) => {
    switch (type) {
        case 'expense':
            return `💸 <b>New Expense Added</b>\n\n` +
                `Amount: ₹${data.amount}\n` +
                `Category: ${data.category}\n` +
                `Description: ${data.description || 'N/A'}\n` +
                `Date: ${new Date(data.date).toLocaleDateString()}\n\n` +
                `💰 <b>Available Balance: ₹${data.balance ? data.balance.toFixed(2) : '0.00'}</b>`;

        case 'income':
            return `💰 <b>New Income Added</b>\n\n` +
                `Amount: ₹${data.amount}\n` +
                `Category: ${data.category}\n` +
                `Description: ${data.description || 'N/A'}\n` +
                `Date: ${new Date(data.date).toLocaleDateString()}\n\n` +
                `💰 <b>Available Balance: ₹${data.balance ? data.balance.toFixed(2) : '0.00'}</b>`;

        case 'budget_exceeded':
            return `⚠️ <b>Budget Alert!</b>\n\n` +
                `You've exceeded your budget for ${data.category}\n` +
                `Budget: ₹${data.budget}\n` +
                `Spent: ₹${data.spent}\n` +
                `Overspent: ₹${data.spent - data.budget}`;

        case 'reminder':
            return `🔔 <b>Reminder Alert</b>\n\n` +
                `${data.title}\n` +
                `${data.description ? data.description + '\n' : ''}` +
                `Time: ${data.time}\n` +
                `${data.timeUntil ? `⏰ ${data.timeUntil} until event` : ''}`;

        case 'weekly_summary':
            return `📊 <b>Weekly Finance Summary</b>\n\n` +
                `Income: ₹${data.totalIncome}\n` +
                `Expenses: ₹${data.totalExpense}\n` +
                `Balance: ₹${data.balance}\n\n` +
                `Top spending: ${data.topCategory || 'N/A'}`;

        case 'welcome':
            return `🎉 <b>Welcome to Finance Tracker!</b>\n\n` +
                `Your Telegram notifications are now enabled.\n` +
                `You'll receive updates about:\n` +
                `• New transactions\n` +
                `• Budget alerts\n` +
                `• Reminders\n` +
                `• Weekly summaries`;

        case 'reminder_created':
            const intervals = data.intervals || [360, 120, 10, 0];
            const formatInterval = (min) => {
                if (min === 0) return 'At event time';
                const hours = Math.floor(min / 60);
                const mins = min % 60;
                if (hours > 0 && mins > 0) return `${hours}h ${mins}min before`;
                if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} before`;
                return `${mins} minute${mins > 1 ? 's' : ''} before`;
            };
            return `✅ <b>Reminder Set Successfully</b>\n\n` +
                `<b>${data.title}</b>\n` +
                `${data.description ? data.description + '\n' : ''}` +
                `📅 ${new Date(data.date).toLocaleDateString()} at ${data.time}\n\n` +
                `🔔 <b>You'll receive notifications:</b>\n` +
                intervals.map(i => `• ${formatInterval(i)}`).join('\n');

        case 'task_created':
            return `✅ <b>Task Created Successfully</b>\n\n` +
                `<b>${data.title}</b>\n` +
                `${data.description ? data.description + '\n' : ''}` +
                `📅 Due: ${new Date(data.dueDate).toLocaleDateString()}${data.dueTime ? ' at ' + data.dueTime : ''}\n` +
                `${data.priority ? `⚡ Priority: ${data.priority.charAt(0).toUpperCase() + data.priority.slice(1)}\n` : ''}\n` +
                `🔔 <b>You'll receive reminders:</b>\n` +
                `• 2 hours before\n` +
                `• 15 minutes before\n` +
                `• At due time`;

        default:
            return data.message || 'Notification from Finance Tracker';
    }
};

module.exports = {
    sendTelegramMessage,
    setTelegramWebhook,
    getWebhookInfo,
    deleteWebhook,
    formatNotificationMessage,
};
