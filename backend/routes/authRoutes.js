const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const generateOTP = require('../utils/otpGenerator');
const sendOTP = require('../utils/sendEmail');

const router = express.Router();


router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();

        if (user && user.isVerified) {
            return res.status(400).json({ message: 'User already exists' });
        }

        if (user && !user.isVerified) {
            // update existing unverified user
            user.name = name;
            user.password = hashedPassword;
            user.otp = otp;
            user.otpExpiry = Date.now() + 2 * 60 * 1000;
            user.otpCooldown = Date.now() + 30 * 1000;

            await user.save();
        } else {
            user = new User({
                name,
                email,
                password: hashedPassword,
                otp,
                otpExpiry: Date.now() + 2 * 60 * 1000,
                otpCooldown: Date.now() + 30 * 1000
            });

            await user.save();
        }

        await sendOTP(email, otp);

        res.json({ message: 'OTP sent to email' });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User not found' });

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;

        await user.save();

        res.json({ message: 'Account verified successfully' });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


router.post('/resend-otp', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User not found' });

        if (user.otpCooldown && user.otpCooldown > Date.now()) {
            return res.status(400).json({ message: 'Wait before requesting OTP again' });
        }

        const otp = generateOTP();

        user.otp = otp;
        user.otpExpiry = Date.now() + 2 * 60 * 1000;
        user.otpCooldown = Date.now() + 30 * 1000;

        await user.save();
        await sendOTP(email, otp);

        res.json({ message: 'OTP resent successfully' });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

        if (!user.isVerified) {
            return res.status(400).json({ message: 'Please verify your email first' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

        const payload = { user: { id: user.id } };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;

                res.json({
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email
                    }
                });
            }
        );

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;