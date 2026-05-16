// utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "guptaarchit12345@gmail.com",
      pass: "jwrbbntgyytqdocf"
    }
  });

  await transporter.sendMail({
    from: '"StockFolio Team" <guptaarchit12345@gmail.com>',
    to: email,
    subject: "🔐 Your Secure OTP - StockFolio",

    html: `
      <div style="margin:0; padding:0; background:#0f172a; font-family:Segoe UI, Arial, sans-serif;">
        
        <div style="max-width:520px; margin:40px auto; background:#1e293b; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          
          <div style="background:linear-gradient(135deg, #3b82f6, #6366f1); padding:20px; text-align:center;">
            <h1 style="color:white; margin:0; font-size:22px;">📈 StockFolio</h1>
            <p style="color:#e0e7ff; font-size:13px;">Secure Portfolio Management</p>
          </div>

          <div style="padding:30px; text-align:center; color:white;">
            <h2>🔐 OTP Verification</h2>

            <p style="color:#cbd5f5; font-size:14px;">
              Use this OTP to complete your signup:
            </p>

            <div style="font-size:34px; font-weight:bold; letter-spacing:8px; background:#0f172a; padding:18px; border-radius:10px; border:1px solid #334155; color:#3b82f6;">
              ${otp}
            </div>

            <p style="margin-top:20px; color:#94a3b8;">⏳ Valid for 2 minutes</p>
          </div>

          <div style="padding:20px; background:#0f172a; text-align:center;">
            <p style="font-size:12px; color:#64748b;">
              If you didn’t request this, ignore this email.
            </p>
          </div>

        </div>
      </div>
    `
  });
};

// 🔥 YE MISSING THA
module.exports = sendOTP;