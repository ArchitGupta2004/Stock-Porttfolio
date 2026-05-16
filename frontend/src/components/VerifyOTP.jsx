import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function VerifyOTP() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(120); // 2 min
  const [expired, setExpired] = useState(false);

  const email = localStorage.getItem("email");

  useEffect(() => {
    if (timeLeft <= 0) {
      setExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);


  const handleVerify = async (e) => {
    e.preventDefault();

    if (expired) {
      setMessage("OTP expired ❌ Please resend");
      return;
    }

    try {
      await api.post('/auth/verify-otp', { email, otp });

      setMessage("✅ Account verified! Redirecting...");
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid OTP ❌");
    }
  };

  const handleResend = async () => {
    try {
      await api.post('/auth/resend-otp', { email });

      setMessage("OTP resent 📧");
      setTimeLeft(120);
      setExpired(false);
      setOtp('');

    } catch {
      setMessage("Failed to resend OTP ❌");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-dark-card p-8 rounded-2xl shadow-xl border border-dark-border">

      <h2 className="text-2xl font-bold text-white mb-4 text-center">
        Verify OTP
      </h2>

      {message && (
        <p className="text-center text-sm mb-4 text-green-400">{message}</p>
      )}

  
      <p className={`text-center mb-4 text-sm ${expired ? 'text-red-400' : 'text-yellow-400'}`}>
        {expired ? "OTP Expired ❌" : `⏳ Expires in ${timeLeft}s`}
      </p>

      <form onSubmit={handleVerify} className="space-y-4">

    
        <input
          type="text"
          placeholder="Enter OTP"
          className="w-full p-3 rounded-lg bg-dark-bg border border-dark-border text-white text-center text-lg tracking-widest"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

  
        <button
          disabled={expired}
          className={`w-full py-3 rounded-lg text-white font-bold transition ${
            expired ? 'bg-gray-500 cursor-not-allowed' : 'bg-brand-primary hover:bg-brand-primary/80'
          }`}
        >
          Verify OTP
        </button>

      </form>

    
      <div className="text-center mt-4">
        <button
          onClick={handleResend}
          className="text-sm text-brand-primary hover:underline"
        >
          Resend OTP
        </button>
      </div>

    </div>
  );
}