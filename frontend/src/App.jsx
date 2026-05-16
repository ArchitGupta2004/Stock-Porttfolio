import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import UserProfile from './components/UserProfile';
import VerifyOTP from './components/VerifyOTP';

function App() {
  const [user, setUser] = useState(null);

  // 🔐 SAFE localStorage handling (CRASH FIX)
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');

      if (storedUser && storedUser !== "undefined") {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Invalid user in localStorage");
      localStorage.removeItem('user');
    }
  }, []);

  // 🔐 Login handler
  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // 🔄 Update profile
  const handleUpdateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-dark-bg text-dark-text">
        <Navbar user={user} onLogout={handleLogout} />

        <div className="container mx-auto px-4 py-8">
          <Routes>

            {/* 🔐 LOGIN */}
            <Route
              path="/login"
              element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />}
            />

            {/* 🆕 REGISTER (OTP FLOW) */}
            <Route
              path="/register"
              element={!user ? <Register /> : <Navigate to="/dashboard" />}
            />

            {/* 🔥 VERIFY OTP */}
            <Route
              path="/verify-otp"
              element={<VerifyOTP />}
            />

            {/* 📊 DASHBOARD (PROTECTED) */}
            <Route
              path="/dashboard"
              element={user ? <Dashboard /> : <Navigate to="/login" />}
            />

            {/* 👤 PROFILE */}
            <Route
              path="/profile"
              element={
                user ? (
                  <UserProfile user={user} onUpdateUser={handleUpdateUser} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* 🔁 DEFAULT REDIRECT */}
            <Route
              path="*"
              element={<Navigate to={user ? "/dashboard" : "/login"} />}
            />

          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;