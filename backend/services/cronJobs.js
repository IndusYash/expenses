const cron = require('node-cron');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Reminder = require('../models/Reminder');
const Task = require('../models/Task');
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
                    // For interval=0 (event time), send if we're within 15 minutes of event
                    // For other intervals, send if we're within 15 minutes of the target time
                    const shouldSend = interval === 0
                        ? minutesUntilEvent <= 15 && minutesUntilEvent >= 0
                        : Math.abs(minutesUntilEvent - interval) <= 15;

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
                            let timeUntil = '';

                            if (interval === 0) {
                                // Event is happening now!
                                timeUntil = 'now';
                            } else {
                                const hoursUntil = Math.floor(interval / 60);
                                const minutesRemaining = interval % 60;
                                if (hoursUntil > 0) {
                                    timeUntil = `${hoursUntil} hour${hoursUntil > 1 ? 's' : ''}`;
                                    if (minutesRemaining > 0) {
                                        timeUntil += ` ${minutesRemaining} min`;
                                    }
                                } else {
                                    timeUntil = `${minutesRemaining} min`;
                                }
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

// Check for upcoming tasks and send notifications
const checkUpcomingTasks = async () => {
    try {
        console.log('Checking for upcoming tasks...');

        // Get all incomplete tasks that have a due time set
        const tasks = await Task.find({
            completed: false,
            dueDate: { $ne: null },
            dueTime: { $ne: null }
        }).populate('user');

        const now = new Date();
        let notificationsSent = 0;
        const notificationIntervals = [120, 15, 0]; // 2 hours, 15 minutes before, and at event time

        for (const task of tasks) {
            try {
                // Skip if user doesn't have any notifications enabled
                if (!task.user || (!task.user.emailNotifications && !task.user.telegramEnabled)) {
                    continue;
                }

                // Combine dueDate and dueTime
                const taskDateTime = new Date(`${task.dueDate.toISOString().split('T')[0]}T${task.dueTime}`);

                // Skip if task is in the past
                if (taskDateTime < now) {
                    continue;
                }

                // Calculate time until task in minutes
                const minutesUntilTask = Math.floor((taskDateTime - now) / (1000 * 60));

                // Check each notification interval (120 min, 15 min, and 0 min)
                for (const interval of notificationIntervals) {
                    // Check if we should send notification for this interval
                    // For interval=0 (event time), send if we're within 15 minutes of event
                    // For other intervals, send if we're within 15 minutes of the target time
                    const shouldSend = interval === 0
                        ? minutesUntilTask <= 15 && minutesUntilTask >= 0
                        : Math.abs(minutesUntilTask - interval) <= 15;

                    // Check if this notification has already been sent
                    const alreadySent = task.sentNotifications.some(
                        notif => notif.interval === interval && (notif.emailSent || notif.telegramSent)
                    );

                    if (shouldSend && !alreadySent) {
                        let emailSent = false;
                        let telegramSent = false;

                        // Prepare notification message
                        let timeUntil = '';

                        if (interval === 0) {
                            // Task is due now!
                            timeUntil = 'now';
                        } else {
                            const hoursUntil = Math.floor(interval / 60);
                            const minutesRemaining = interval % 60;
                            if (hoursUntil > 0) {
                                timeUntil = `${hoursUntil} hour${hoursUntil > 1 ? 's' : ''}`;
                                if (minutesRemaining > 0) {
                                    timeUntil += ` ${minutesRemaining} min`;
                                }
                            } else {
                                timeUntil = `${minutesRemaining} min`;
                            }
                        }

                        // Send email if enabled
                        if (task.user.emailNotifications) {
                            try {
                                const nodemailer = require('nodemailer');
                                const transporter = nodemailer.createTransport({
                                    service: 'gmail',
                                    auth: {
                                        user: process.env.EMAIL_USER,
                                        pass: process.env.EMAIL_PASS,
                                    },
                                });

                                const mailOptions = {
                                    from: process.env.EMAIL_USER,
                                    to: task.user.email,
                                    subject: `⏰ Task Reminder: ${task.title}`,
                                    html: `
                                        <h2>Task Reminder</h2>
                                        <p><strong>Task:</strong> ${task.title}</p>
                                        ${task.description ? `<p><strong>Description:</strong> ${task.description}</p>` : ''}
                                        <p><strong>Due:</strong> ${taskDateTime.toLocaleString()}</p>
                                        <p><strong>Time Until:</strong> ${timeUntil}</p>
                                        <p><strong>Priority:</strong> ${task.priority.toUpperCase()}</p>
                                        <p>Don't forget to complete this task!</p>
                                    `,
                                };

                                await transporter.sendMail(mailOptions);
                                emailSent = true;
                            } catch (error) {
                                console.error('Error sending task reminder email:', error);
                            }
                        }

                        // Send Telegram notification if enabled
                        if (task.user.telegramEnabled && task.user.telegramChatId) {
                            const message = `⏰ <b>Task Reminder</b>\n\n` +
                                `📋 <b>${task.title}</b>\n` +
                                (task.description ? `${task.description}\n\n` : '\n') +
                                `🕐 Due: ${taskDateTime.toLocaleString()}\n` +
                                `⏳ Time until: ${timeUntil}\n` +
                                `🎯 Priority: ${task.priority.toUpperCase()}`;

                            telegramSent = await sendTelegramMessage(task.user.telegramChatId, message);
                        }

                        if (emailSent || telegramSent) {
                            // Mark notification as sent
                            task.sentNotifications.push({
                                interval,
                                sentAt: new Date(),
                                emailSent,
                                telegramSent,
                            });
                            await task.save();
                            notificationsSent++;
                            console.log(`Sent ${interval}-minute task reminder for: ${task.title}`);
                        }
                    }
                }
            } catch (error) {
                console.error(`Error processing task ${task._id}:`, error);
            }
        }

        console.log(`Task check completed. Sent ${notificationsSent} notifications.`);
    } catch (error) {
        console.error('Error in task notification cron job:', error);
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

    // Check for upcoming tasks every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
        console.log('Running task notification check');
        await checkUpcomingTasks();
    });

    console.log('Cron jobs initialized:');
    console.log('- Weekly summaries: Sundays at 9:00 AM');
    console.log('- Reminder notifications: Every 15 minutes');
    console.log('- Task notifications: Every 15 minutes');
};

module.exports = {
    initCronJobs,
    sendWeeklySummaries, // Export for manual testing
    checkUpcomingReminders, // Export for manual testing
    checkUpcomingTasks, // Export for manual testing
};
