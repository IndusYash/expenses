const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Verify connection (non-blocking)
transporter.verify((error, success) => {
    if (error) {
        console.warn('⚠️  Email service not configured properly:', error.message);
        console.warn('   Email features will not work until configured.');
    } else {
        console.log('✅ Email service is ready');
    }
});

module.exports = transporter;
