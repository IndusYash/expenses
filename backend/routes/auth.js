const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, updateEmailPreferences, sendTestEmail, sendSummaryNow, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/email-preferences', protect, updateEmailPreferences);
router.put('/change-password', protect, changePassword);
router.post('/send-test-email', protect, sendTestEmail);
router.post('/send-summary', protect, sendSummaryNow);

module.exports = router;
