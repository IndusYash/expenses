const transporter = require('../config/email');

// Generate HTML email template for weekly summary
const generateEmailTemplate = (user, summary) => {
  const { totalIncome, totalExpense, balance, transactions, categoryBreakdown } = summary;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; background-color: #f7fafc; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; padding: 20px; }
        .card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
        .card-label { font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 5px; }
        .card-value { font-size: 24px; font-weight: bold; }
        .income { color: #10b981; }
        .expense { color: #ef4444; }
        .balance { color: #3b82f6; }
        .section { padding: 20px; border-top: 1px solid #e2e8f0; }
        .section-title { font-size: 18px; font-weight: bold; color: #1e293b; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 12px; color: #64748b; text-transform: uppercase; }
        td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        .footer a { color: #667eea; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💼 Weekly Finance Summary</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Your financial overview for the past week</p>
        </div>
        
        <div class="summary-cards">
          <div class="card">
            <div class="card-label">Total Income</div>
            <div class="card-value income">$${totalIncome.toLocaleString()}</div>
          </div>
          <div class="card">
            <div class="card-label">Total Expenses</div>
            <div class="card-value expense">$${totalExpense.toLocaleString()}</div>
          </div>
          <div class="card">
            <div class="card-label">Balance</div>
            <div class="card-value balance">$${balance.toLocaleString()}</div>
          </div>
        </div>

        ${categoryBreakdown.length > 0 ? `
        <div class="section">
          <div class="section-title">📊 Top Spending Categories</div>
          <table>
            <tr>
              <th>Category</th>
              <th style="text-align: right;">Amount</th>
            </tr>
            ${categoryBreakdown.slice(0, 5).map(cat => `
              <tr>
                <td>${cat.category}</td>
                <td style="text-align: right; font-weight: 600;">$${cat.amount.toLocaleString()}</td>
              </tr>
            `).join('')}
          </table>
        </div>
        ` : ''}

        ${transactions.length > 0 ? `
        <div class="section">
          <div class="section-title">📝 Recent Transactions</div>
          <table>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th style="text-align: right;">Amount</th>
            </tr>
            ${transactions.slice(0, 10).map(t => `
              <tr>
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td>${t.category}</td>
                <td>${t.description}</td>
                <td style="text-align: right; font-weight: 600; color: ${t.type === 'income' ? '#10b981' : '#ef4444'};">
                  ${t.type === 'income' ? '+' : '-'}$${t.amount.toLocaleString()}
                </td>
              </tr>
            `).join('')}
          </table>
        </div>
        ` : ''}

        <div class="footer">
          <p>This is an automated weekly summary from Finance Tracker.</p>
          <p>You can manage your email preferences in your <a href="${process.env.CLIENT_URL}/profile">Profile Settings</a>.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send weekly summary email
const sendWeeklySummary = async (user, transactions) => {
  try {
    // Calculate summary
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weekTransactions = transactions.filter(t => new Date(t.date) >= weekAgo);

    const totalIncome = weekTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = weekTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    // Category breakdown
    const categoryBreakdown = weekTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const existing = acc.find(item => item.category === t.category);
        if (existing) {
          existing.amount += t.amount;
        } else {
          acc.push({ category: t.category, amount: t.amount });
        }
        return acc;
      }, [])
      .sort((a, b) => b.amount - a.amount);

    const summary = {
      totalIncome,
      totalExpense,
      balance,
      transactions: weekTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)),
      categoryBreakdown,
    };

    const htmlContent = generateEmailTemplate(user, summary);

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `Your Weekly Finance Summary - ${new Date().toLocaleDateString()}`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Weekly summary sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Send test email
const sendTestEmail = async (email) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Test Email - Finance Tracker',
      html: '<h1>Email service is working!</h1><p>Your Finance Tracker email configuration is set up correctly.</p>',
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending test email:', error);
    return false;
  }
};

// Send reminder email
const sendReminderEmail = async (user, reminder, intervalMinutes = null) => {
  try {
    // Calculate time until event for display
    let timeUntilEvent = '';
    let urgencyColor = '#f59e0b'; // Default orange

    if (intervalMinutes !== null) {
      const hours = Math.floor(intervalMinutes / 60);
      const minutes = intervalMinutes % 60;

      if (hours > 0) {
        timeUntilEvent = hours === 1 ? '1 hour' : `${hours} hours`;
        if (minutes > 0) timeUntilEvent += ` ${minutes} min`;
      } else {
        timeUntilEvent = `${minutes} minutes`;
      }

      // Set urgency color based on time
      if (intervalMinutes <= 60) {
        urgencyColor = '#ef4444'; // Red for 1 hour or less
      } else if (intervalMinutes <= 360) {
        urgencyColor = '#f59e0b'; // Orange for 6 hours or less
      } else {
        urgencyColor = '#3b82f6'; // Blue for more than 6 hours
      }
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background-color: #f7fafc; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, ${urgencyColor} 0%, ${urgencyColor}dd 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 30px; }
          .time-badge { background: ${urgencyColor}22; border: 2px solid ${urgencyColor}; color: ${urgencyColor}; padding: 12px 20px; border-radius: 8px; font-size: 18px; font-weight: bold; text-align: center; margin: 20px 0; }
          .reminder-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .reminder-title { font-size: 20px; font-weight: bold; color: #92400e; margin-bottom: 10px; }
          .reminder-detail { margin: 10px 0; color: #78350f; }
          .reminder-detail strong { color: #92400e; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
          .footer a { color: ${urgencyColor}; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Reminder Alert</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">${timeUntilEvent ? `Event in ${timeUntilEvent}` : 'You have a reminder due'}</p>
          </div>
          
          <div class="content">
            ${timeUntilEvent ? `<div class="time-badge">⏰ ${timeUntilEvent} until event</div>` : ''}
            
            <div class="reminder-box">
              <div class="reminder-title">${reminder.title}</div>
              ${reminder.description ? `<p style="color: #78350f; margin-top: 10px;">${reminder.description}</p>` : ''}
              <div class="reminder-detail"><strong>📅 Date:</strong> ${new Date(reminder.reminderDate).toLocaleDateString()}</div>
              <div class="reminder-detail"><strong>⏰ Time:</strong> ${reminder.eventTime || reminder.reminderTime}</div>
              <div class="reminder-detail"><strong>📂 Category:</strong> ${reminder.category}</div>
              <div class="reminder-detail"><strong>⚡ Priority:</strong> ${reminder.priority.toUpperCase()}</div>
            </div>
          </div>

          <div class="footer">
            <p>This is an automated reminder from Finance Tracker.</p>
            <p>Manage your reminders in your <a href="${process.env.CLIENT_URL}/reminders">Reminders Page</a>.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `🔔 Reminder: ${reminder.title}${timeUntilEvent ? ` (in ${timeUntilEvent})` : ''}`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${user.email} for: ${reminder.title}`);
    return true;
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return false;
  }
};

module.exports = {
  sendWeeklySummary,
  sendTestEmail,
  sendReminderEmail,
};
