const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false,
    },
    profilePhoto: {
        type: String,
        default: null,
    },
    emailNotifications: {
        type: Boolean,
        default: true,
    },
    reminderNotifications: {
        type: Boolean,
        default: true,
    },
    lastEmailSent: {
        type: Date,
        default: null,
    },
    telegramChatId: {
        type: Number,
        default: null,
    },
    telegramEnabled: {
        type: Boolean,
        default: false,
    },
    telegramLinkToken: {
        type: String,
        default: null,
    },
    telegramLinkTokenExpiry: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
