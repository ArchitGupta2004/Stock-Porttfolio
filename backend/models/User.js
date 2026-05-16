const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },

    email: { 
        type: String, 
        required: true, 
        unique: true 
    },

    password: { 
        type: String, 
        required: true 
    },

    // 🔐 OTP + Verification fields
    isVerified: { 
        type: Boolean, 
        default: false 
    },

    otp: { 
        type: String 
    },

    otpExpiry: { 
        type: Date 
    },

    otpCooldown: { 
        type: Date 
    }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);