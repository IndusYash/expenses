const express = require('express');
const router = express.Router();
const {
    getReminders,
    createReminder,
    updateReminder,
    deleteReminder,
    markComplete,
} = require('../controllers/reminderController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getReminders);
router.post('/', protect, createReminder);
router.put('/:id', protect, updateReminder);
router.delete('/:id', protect, deleteReminder);
router.put('/:id/complete', protect, markComplete);

module.exports = router;
