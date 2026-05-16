const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateOTP = require("../utils/otpGenerator");
const sendOTP = require("../utils/sendEmail");

// SIGNUP
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser && existingUser.isVerified) {
    return res.status(400).json({ message: "Email already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOTP();

  if (existingUser && !existingUser.isVerified) {
    existingUser.name = name;
    existingUser.password = hashedPassword;
    existingUser.otp = otp;
    existingUser.otpExpiry = Date.now() + 5 * 60 * 1000;
    existingUser.otpCooldown = Date.now() + 30 * 1000;

    await existingUser.save();
  } else {
    const user = new User({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000,
      otpCooldown: Date.now() + 30 * 1000
    });

    await user.save();
  }

  await sendOTP(email, otp);

  res.json({ message: "OTP sent successfully" });
};

// VERIFY OTP
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ message: "User not found" });

  if (user.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (user.otpExpiry < Date.now()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExpiry = null;

  await user.save();

  res.json({ message: "Account verified successfully" });
};

// RESEND OTP
exports.resendOTP = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ message: "User not found" });

  if (user.otpCooldown && user.otpCooldown > Date.now()) {
    return res.status(400).json({ message: "Wait before requesting OTP" });
  }

  const otp = generateOTP();

  user.otp = otp;
  user.otpExpiry = Date.now() + 5 * 60 * 1000;
  user.otpCooldown = Date.now() + 30 * 1000;

  await user.save();
  await sendOTP(email, otp);

  res.json({ message: "OTP resent successfully" });
};