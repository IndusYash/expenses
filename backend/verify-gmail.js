require('dotenv').config();

console.log('\n=== Gmail App Password Verification ===\n');

console.log('Current Configuration:');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);
console.log('Password length:', process.env.EMAIL_PASSWORD?.length, '(should be 16)');
console.log('Has spaces:', process.env.EMAIL_PASSWORD?.includes(' '), '(should be false)');

console.log('\n=== Testing Gmail Connection ===\n');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error('❌ FAILED - Gmail rejected the credentials\n');
        console.error('Error:', error.message);
        console.error('Error code:', error.code);

        console.log('\n🔧 SOLUTION:');
        console.log('Since you have 2FA enabled, the App Password is wrong.');
        console.log('\nSteps to fix:');
        console.log('1. Go to: https://myaccount.google.com/apppasswords');
        console.log('2. You may need to REVOKE the old "Finance Tracker" password first');
        console.log('3. Create a BRAND NEW App Password');
        console.log('4. Copy the 16 characters (remove spaces)');
        console.log('5. Update .env line 22: EMAIL_PASSWORD=new-password');
        console.log('6. Run this test again: node verify-gmail.js');

    } else {
        console.log('✅ SUCCESS! Gmail authentication working!');
        console.log('Email service is ready to send emails.');
    }
    process.exit(error ? 1 : 0);
});
