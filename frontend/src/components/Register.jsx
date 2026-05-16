import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/auth/register', { name, email, password });

      setMessage("OTP sent to your email 📧");
      setShowOTP(true);

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  
  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      await api.post('/auth/verify-otp', { email, otp });

      alert("✅ Account verified! Now login.");
      navigate('/login');

    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = otp.split("");
    newOtp[index] = value;
    const updatedOtp = newOtp.join("");
    setOtp(updatedOtp);


    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-dark-card p-8 rounded-2xl shadow-xl border border-dark-border">

      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">
          {showOTP ? "Verify OTP" : "Create Account"}
        </h2>
      </div>

      {message && <p className="text-green-400 text-center mb-4">{message}</p>}
      {error && <p className="text-red-400 text-center mb-4">{error}</p>}

      {!showOTP ? (
   
        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 rounded-lg bg-dark-bg border border-dark-border text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-dark-bg border border-dark-border text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-dark-bg border border-dark-border text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="w-full bg-brand-primary py-3 rounded-lg text-white font-bold hover:bg-brand-primary/80 transition">
            Create Account
          </button>
        </form>

      ) : (
       
        <form onSubmit={handleVerify} className="space-y-6 text-center">

          <p className="text-dark-muted text-sm">
            Enter the 6-digit code sent to <br />
            <span className="text-white font-medium">{email}</span>
          </p>

         
          <div className="flex justify-center gap-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                maxLength="1"
                className="w-12 h-14 text-center text-xl font-bold rounded-lg bg-dark-bg border border-dark-border text-white focus:border-brand-primary focus:outline-none"
                value={otp[i] || ""}
                onChange={(e) => handleOtpChange(e.target.value, i)}
              />
            ))}
          </div>

         
          <button className="w-full bg-green-500 hover:bg-green-600 py-3 rounded-lg text-white font-bold transition">
            Verify OTP
          </button>

         
          <button
            type="button"
            className="text-sm text-brand-primary hover:underline"
            onClick={async () => {
              try {
                await api.post('/auth/resend-otp', { email });
                alert("OTP resent 📧");
              } catch {
                setError("Failed to resend OTP");
              }
            }}
          >
            Resend OTP
          </button>

        </form>
      )}

      {!showOTP && (
        <p className="mt-6 text-center text-dark-muted text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-primary hover:underline">
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}