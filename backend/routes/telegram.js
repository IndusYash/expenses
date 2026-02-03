const express = require('express');
const router = express.Router();
const {
    handleWebhook,
    linkTelegramAccount,
    unlinkTelegramAccount,
    getTelegramStatus,
    testTelegramNotification,
    generateLinkToken,
} = require('../controllers/telegramController');
const { protect } = require('../middleware/auth');

// Public webhook endpoint (no auth required)
router.post('/webhook', handleWebhook);

// Protected routes (require authentication)
router.post('/generate-token', protect, generateLinkToken);
router.post('/link', protect, linkTelegramAccount);
router.post('/unlink', protect, unlinkTelegramAccount);
router.get('/status', protect, getTelegramStatus);
router.post('/test', protect, testTelegramNotification);

module.exports = router;
