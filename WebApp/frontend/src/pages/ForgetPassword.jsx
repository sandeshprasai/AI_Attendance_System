import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgetPassword = () => {
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const createRipple = (e) => {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  const handleSendOTP = async (e) => {
    createRipple(e);

    if (!username.trim()) {
      console.log("Using API_URL:", API_URL);
      showMessage('Please enter your username', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}api/v1/auth/initiate-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await res.json();

      if (res.status === 200) {
        showMessage(data.message, "success");
        setOtpSent(true);
        setShowAdditionalFields(true);
      } else {
        showMessage(data.message || "Error sending OTP", "error");
      }
    } catch (err) {
      console.error("ForgetPassword Error:", err);
      showMessage(err.message || "Server error. Try again later.", "error");
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    createRipple(e);

    if (!otp.trim()) {
      showMessage('Please enter the OTP', 'error');
      return;
    }

    if (!newPassword || !confirmPassword) {
      showMessage('Please enter both password fields', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showMessage('Password must be at least 6 characters long', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage('Passwords do not match', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}api/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          otp,
          password: newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (res.status === 200) {
        showMessage(data.message || "Password reset successful", "success");
        setTimeout(() => {
          setUsername('');
          setOtp('');
          setNewPassword('');
          setConfirmPassword('');
          setShowAdditionalFields(false);
          setOtpSent(false);
        }, 2000);
      } else {
        showMessage(data.message || "Failed to reset password", "error");
      }
    } catch (err) {
      console.error("ResetPassword Error:", err);
      showMessage(err.message || "Server error. Try again later.", "error");
    }
    setIsLoading(false);
  };

  return (
    <>
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.4),
                        0 0 40px rgba(59, 130, 246, 0.3),
                        inset 0 0 20px rgba(255, 255, 255, 0.05);
          }
          50% {
            box-shadow: 0 0 30px rgba(6, 182, 212, 0.6),
                        0 0 60px rgba(59, 130, 246, 0.5),
                        inset 0 0 30px rgba(255, 255, 255, 0.08);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }

        .gradient-bg {
          background: linear-gradient(to bottom right, #020617, #172554, #020617);
        }

        .glass-card {
          background: linear-gradient(to bottom right, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          animation: pulse-glow 4s ease-in-out infinite;
        }

        .slide-in {
          animation: slideIn 0.5s ease-out forwards;
        }

        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(6, 182, 212, 0.5);
          width: 20px;
          height: 20px;
          animation: ripple 0.6s ease-out;
          pointer-events: none;
        }

        .input-glow:focus {
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.3);
          border-color: #06b6d4;
        }

        .button-glow {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .button-glow::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .button-glow:hover::before {
          width: 300px;
          height: 300px;
        }

        .button-glow:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(6, 182, 212, 0.5);
        }

        .button-glow:active {
          transform: translateY(-1px);
        }

        .delay-700 {
          animation-delay: 700ms;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>

      <div className="min-h-screen gradient-bg text-white overflow-x-hidden">

        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-700"></div>
          <div className="absolute -bottom-32 left-1/3 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
        </div>

        {/* Main Container */}
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md z-10">

            {/* Main Card */}
            <div className="glass-card rounded-3xl border border-white border-opacity-20 shadow-2xl overflow-hidden">

              {/* Header */}
              <div className="relative bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 px-8 py-12 text-center overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>

                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Reset Password</h3>
                  <p className="text-blue-100">Enter your credentials to continue</p>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-8 md:p-10">

                {/* Message Box */}
                {message.text && (
                  <div className={`mb-6 p-4 rounded-xl slide-in backdrop-blur-md border ${message.type === 'success'
                    ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                    : 'bg-red-500/20 border-red-400/50 text-red-300'
                    } shadow-lg`}>
                    <div className="flex items-center gap-3">
                      {message.type === 'success' ? (
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className="text-sm font-medium">{message.text}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleResetPassword}>
                  {/* Username Section */}
                  <div className="mb-6">
                    <label className="block text-slate-300 font-medium mb-2 text-sm">
                      Username:
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={otpSent}
                        placeholder="Enter your username"
                        className="flex-1 bg-slate-800/50 text-white px-4 py-3 rounded-lg border-2 border-slate-700 focus:border-cyan-500 outline-none transition-all duration-300 input-glow disabled:opacity-50 disabled:cursor-not-allowed placeholder-slate-500"
                      />
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={otpSent || isLoading}
                        className={`relative overflow-hidden px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 button-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none bg-gradient-to-r from-cyan-500 to-blue-600`}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                        ) : otpSent ? (
                          <span className="flex items-center gap-2 relative z-10">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Sent
                          </span>
                        ) : (
                          <span className="relative z-10">Send OTP</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Additional Fields */}
                  {showAdditionalFields && (
                    <div className="space-y-5 slide-in">
                      {/* OTP Field */}
                      <div>
                        <label className="block text-slate-300 font-medium mb-2 text-sm">
                          OTP:
                        </label>
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                          maxLength="6"
                          placeholder="Enter 6-digit OTP"
                          className="w-full bg-slate-800/50 text-white px-4 py-3 rounded-lg border-2 border-slate-700 focus:border-cyan-500 outline-none transition-all duration-300 input-glow placeholder-slate-500"
                        />
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="block text-slate-300 font-medium mb-2 text-sm">
                          New Password:
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="w-full bg-slate-800/50 text-white px-4 py-3 rounded-lg border-2 border-slate-700 focus:border-cyan-500 outline-none transition-all duration-300 input-glow placeholder-slate-500"
                        />
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-slate-300 font-medium mb-2 text-sm">
                          Confirm Password:
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="w-full bg-slate-800/50 text-white px-4 py-3 rounded-lg border-2 border-slate-700 focus:border-cyan-500 outline-none transition-all duration-300 input-glow placeholder-slate-500"
                        />
                      </div>

                      {/* Reset Button */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="relative overflow-hidden w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3.5 rounded-lg font-semibold transition-all duration-300 button-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6 shadow-lg"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2 relative z-10">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <span className="relative z-10">Reset Password</span>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>

              {/* Footer */}
              <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 px-8 py-6 text-center border-t border-white/10">
                <p className="text-sm text-slate-400 mb-2">
                  Remember your password? <Link to="/" className="text-cyan-400 hover:text-cyan-300 font-semibold">Back to Login</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgetPassword;