const cron = require('node-cron');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Reminder = require('../models/Reminder');
const { sendWeeklySummary, sendReminderEmail } = require('./emailService');
const { sendTelegramMessage, formatNotificationMessage } = require('./telegramService');

// Send weekly summaries to all users with email notifications enabled
const sendWeeklySummaries = async () => {
    try {
        console.log('Starting weekly summary job...');

        // Find all users with email or Telegram notifications enabled
        const users = await User.find({
            $or: [
                { emailNotifications: true },
                { telegramEnabled: true }
            ]
        });

        console.log(`Found ${users.length} users with notifications enabled`);

        for (const user of users) {
            try {
                // Get user's transactions from the last 7 days
                const lastWeek = new Date();
                lastWeek.setDate(lastWeek.getDate() - 7);

                const transactions = await Transaction.find({
                    user: user._id,
                    date: { $gte: lastWeek }
                });

                // Calculate summary data
                const totalIncome = transactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0);

                const totalExpense = transactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);

                const balance = totalIncome - totalExpense;

                // Find top spending category
                const categoryTotals = {};
                transactions
                    .filter(t => t.type === 'expense')
                    .forEach(t => {
                        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
                    });

                const topCategory = Object.keys(categoryTotals).length > 0
                    ? Object.keys(categoryTotals).reduce((a, b) =>
                        categoryTotals[a] > categoryTotals[b] ? a : b
                    )
                    : 'N/A';

                // Send email if enabled
                if (user.emailNotifications) {
                    const emailSent = await sendWeeklySummary(user, transactions);
                    if (emailSent) {
                        user.lastEmailSent = new Date();
                        await user.save();
                    }
                }

                // Send Telegram notification if enabled
                if (user.telegramEnabled && user.telegramChatId) {
                    const message = formatNotificationMessage('weekly_summary', {
                        totalIncome,
                        totalExpense,
                        balance,
                        topCategory
                    });
                    await sendTelegramMessage(user.telegramChatId, message);
                }
            } catch (error) {
                console.error(`Error sending notifications to ${user.email}:`, error);
            }
        }

        console.log('Weekly summary job completed');
    } catch (error) {
        console.error('Error in weekly summary cron job:', error);
    }
};

// Check for upcoming reminders and send notifications
const checkUpcomingReminders = async () => {
    try {
        console.log('Checking for upcoming reminders...');

        // Get all active reminders that haven't been completed
        const reminders = await Reminder.find({ completed: false }).populate('user');

        const now = new Date();
        let notificationsSent = 0;

        for (const reminder of reminders) {
            try {
                // Skip if user doesn't have any notifications enabled
                if (!reminder.user || (!reminder.user.emailNotifications && !reminder.user.telegramEnabled)) {
                    continue;
                }

                // Combine reminderDate and eventTime (or use reminderTime as fallback)
                const eventTimeStr = reminder.eventTime || reminder.reminderTime;
                const eventDateTime = new Date(`${reminder.reminderDate.toISOString().split('T')[0]}T${eventTimeStr}`);

                // Skip if event is in the past
                if (eventDateTime < now) {
                    continue;
                }

                // Calculate time until event in minutes
                const minutesUntilEvent = Math.floor((eventDateTime - now) / (1000 * 60));

                // Check each notification interval
                for (const interval of reminder.notificationIntervals) {
                    // Check if we should send notification for this interval
                    // Send if we're within 15 minutes of the target time (to account for cron frequency)
                    const shouldSend = Math.abs(minutesUntilEvent - interval) <= 15;

                    // Check if this notification has already been sent
                    const alreadySent = reminder.sentNotifications.some(
                        notif => notif.interval === interval && (notif.emailSent || notif.telegramSent)
                    );

                    if (shouldSend && !alreadySent) {
                        let emailSent = false;
                        let telegramSent = false;

                        // Send email if enabled
                        if (reminder.user.emailNotifications) {
                            emailSent = await sendReminderEmail(reminder.user, reminder, interval);
                        }

                        // Send Telegram notification if enabled
                        if (reminder.user.telegramEnabled && reminder.user.telegramChatId) {
                            const hoursUntil = Math.floor(interval / 60);
                            const minutesRemaining = interval % 60;
                            let timeUntil = '';
                            if (hoursUntil > 0) {
                                timeUntil = `${hoursUntil} hour${hoursUntil > 1 ? 's' : ''}`;
                                if (minutesRemaining > 0) {
                                    timeUntil += ` ${minutesRemaining} min`;
                                }
                            } else {
                                timeUntil = `${minutesRemaining} min`;
                            }

                            const message = formatNotificationMessage('reminder', {
                                title: reminder.title,
                                description: reminder.description,
                                time: eventDateTime.toLocaleString(),
                                timeUntil
                            });
                            telegramSent = await sendTelegramMessage(reminder.user.telegramChatId, message);
                        }

                        if (emailSent || telegramSent) {
                            // Mark notification as sent
                            reminder.sentNotifications.push({
                                interval,
                                sentAt: new Date(),
                                emailSent,
                                telegramSent,
                            });
                            await reminder.save();
                            notificationsSent++;
                            console.log(`Sent ${interval}-minute reminder for: ${reminder.title}`);
                        }
                    }
                }
            } catch (error) {
                console.error(`Error processing reminder ${reminder._id}:`, error);
            }
        }

        console.log(`Reminder check completed. Sent ${notificationsSent} notifications.`);
    } catch (error) {
        console.error('Error in reminder notification cron job:', error);
    }
};

// Initialize cron jobs
const initCronJobs = () => {
    // Run every Sunday at 9:00 AM
    cron.schedule('0 9 * * 0', async () => {
        console.log('Running weekly email summary cron job');
        await sendWeeklySummaries();
    });

    // Check for upcoming reminders every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
        console.log('Running reminder notification check');
        await checkUpcomingReminders();
    });

    console.log('Cron jobs initialized:');
    console.log('- Weekly summaries: Sundays at 9:00 AM');
    console.log('- Reminder notifications: Every 15 minutes');
};

module.exports = {
    initCronJobs,
    sendWeeklySummaries, // Export for manual testing
    checkUpcomingReminders, // Export for manual testing
};
