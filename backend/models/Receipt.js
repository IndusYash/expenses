const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    fileName: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    amount: {
        type: Number,
        default: 0,
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        default: null,
    },
}, {
    timestamps: true,
});

// Index for faster queries
receiptSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Receipt', receiptSchema);
