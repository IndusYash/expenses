const Receipt = require('../models/Receipt');

// @desc    Get all receipts for user
// @route   GET /api/receipts
// @access  Private
const getReceipts = async (req, res) => {
    try {
        const receipts = await Receipt.find({ user: req.user._id })
            .sort({ date: -1 })
            .populate('transaction', 'description amount');
        res.json(receipts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new receipt
// @route   POST /api/receipts
// @access  Private
const createReceipt = async (req, res) => {
    try {
        const { image, fileName, date, description, amount, transaction } = req.body;

        const receipt = await Receipt.create({
            user: req.user._id,
            image,
            fileName,
            date,
            description,
            amount,
            transaction,
        });

        res.status(201).json(receipt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update receipt
// @route   PUT /api/receipts/:id
// @access  Private
const updateReceipt = async (req, res) => {
    try {
        const receipt = await Receipt.findById(req.params.id);

        if (!receipt) {
            return res.status(404).json({ message: 'Receipt not found' });
        }

        // Check user owns receipt
        if (receipt.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedReceipt = await Receipt.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedReceipt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete receipt
// @route   DELETE /api/receipts/:id
// @access  Private
const deleteReceipt = async (req, res) => {
    try {
        const receipt = await Receipt.findById(req.params.id);

        if (!receipt) {
            return res.status(404).json({ message: 'Receipt not found' });
        }

        // Check user owns receipt
        if (receipt.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await receipt.deleteOne();
        res.json({ message: 'Receipt removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getReceipts,
    createReceipt,
    updateReceipt,
    deleteReceipt,
};
