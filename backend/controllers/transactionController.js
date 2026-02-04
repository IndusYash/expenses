const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { sendTelegramMessage, formatNotificationMessage } = require('../services/telegramService');

// @desc    Get all transactions for user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
    try {
        const { type, category, amount, date, description, receipt } = req.body;

        const transaction = await Transaction.create({
            user: req.user._id,
            type,
            category,
            amount,
            date,
            description,
            receipt,
        });

        // Send Telegram notification if enabled
        const user = await User.findById(req.user._id);
        if (user.telegramEnabled && user.telegramChatId) {
            // Calculate current balance
            const allTransactions = await Transaction.find({ user: req.user._id });
            const balance = allTransactions.reduce((total, t) => {
                return t.type === 'income' ? total + t.amount : total - t.amount;
            }, 0);

            const messageType = type === 'expense' ? 'expense' : 'income';
            const message = formatNotificationMessage(messageType, {
                amount,
                category,
                description,
                date,
                balance,
            });
            await sendTelegramMessage(user.telegramChatId, message);
        }

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Check user owns transaction
        if (transaction.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedTransaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedTransaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Check user owns transaction
        if (transaction.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await transaction.deleteOne();
        res.json({ message: 'Transaction removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
};
