require('dotenv').config();

console.log('=== Detailed Email Configuration Check ===\n');

console.log('1. Environment Variables:');
console.log('   EMAIL_SERVICE:', `"${process.env.EMAIL_SERVICE}"`);
console.log('   EMAIL_USER:', `"${process.env.EMAIL_USER}"`);
console.log('   EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0);
console.log('   EMAIL_PASSWORD:', `"${process.env.EMAIL_PASSWORD}"`);
console.log('   EMAIL_FROM:', `"${process.env.EMAIL_FROM}"`);

console.log('\n2. Checking for issues:');
console.log('   - EMAIL_USER is set:', !!process.env.EMAIL_USER);
console.log('   - EMAIL_PASSWORD is set:', !!process.env.EMAIL_PASSWORD);
console.log('   - EMAIL_PASSWORD has correct length (16):', process.env.EMAIL_PASSWORD?.length === 16);
console.log('   - EMAIL_PASSWORD has no spaces:', !process.env.EMAIL_PASSWORD?.includes(' '));

console.log('\n3. Nodemailer Configuration:');
const config = {
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
};
console.log('   Config:', JSON.stringify(config, null, 2));

console.log('\n4. Testing connection...');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport(config);

transporter.verify((error, success) => {
    if (error) {
        console.error('\n❌ AUTHENTICATION FAILED');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('\n🔧 SOLUTION:');
        console.error('1. Go to: https://myaccount.google.com/apppasswords');
        console.error('2. Generate a NEW App Password');
        console.error('3. Copy it (remove spaces)');
        console.error('4. Update .env file: EMAIL_PASSWORD=your-new-password');
        console.error('5. Restart the server');
    } else {
        console.log('\n✅ SUCCESS! Email is configured correctly.');
    }
    process.exit(error ? 1 : 0);
});
