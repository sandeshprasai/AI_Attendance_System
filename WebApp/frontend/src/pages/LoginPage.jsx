import { useState } from 'react';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
 const navigate = useNavigate();
 const [rememberMe, setRememberMe] = useState(false);

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle email change with validation
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  // Handle password change with validation
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    if (value && value.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    } else {
      setPasswordError('');
    }
  };

  const handleLogin = async () => {
  let hasError = false;

  if (!email) {
    setEmailError('Email is required');
    hasError = true;
  } else if (!validateEmail(email)) {
    setEmailError('Please enter a valid email address');
    hasError = true;
  }

  if (!password) {
    setPasswordError('Password is required');
    hasError = true;
  } else if (password.length < 6) {
    setPasswordError('Password must be at least 6 characters');
    hasError = true;
  }

  if (hasError) return;

  try {
    setIsLoading(true);

    const response = await fetch("http://localhost:9000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: email,
        password,
        rememberMe
      })
    });
    

    const data = await response.json();
    setIsLoading(false);

    if (!response.ok) {
      alert(data.message || "Login failed");
      return;
    }

    // ---- Save tokens based on rememberMe ----
    if (rememberMe) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
    } else {
      sessionStorage.setItem("accessToken", data.accessToken);
      sessionStorage.setItem("refreshToken", data.refreshToken);
    }

    // ---- Decode role from token payload ----
    const payload = JSON.parse(atob(data.accessToken.split(".")[1]));
    const role = payload.role;

    // ---- Redirect based on role ----
    if (role === "admin") navigate("/admin-dashboard");
    else if (role === "teacher") navigate("/teacher-dashboard");
    else if (role === "student") navigate("/student-dashboard");
    else navigate("/");

  } catch (err) {
    setIsLoading(false);
    console.error(err);
    alert("Something went wrong!");
  }
};
  return (
    <div className="w-full space-y-5">
      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-slate-400" />
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            className={`block w-full pl-10 pr-3 py-3 bg-white bg-opacity-90 border ${
              emailError ? 'border-purple-400 bg-purple-50' : 'border-white border-opacity-20'
            } rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 ${
              emailError ? 'focus:ring-purple-400' : 'focus:ring-cyan-500'
            } focus:border-transparent transition-all duration-200 outline-none backdrop-blur-sm`}
            placeholder="you@example.com"
          />
        </div>
        {emailError && (
          <p className="mt-1.5 text-xs text-purple-400 flex items-center gap-1.5 animate-shake">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{emailError}</span>
          </p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-slate-400" />
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={handlePasswordChange}
            className={`block w-full pl-10 pr-12 py-3 bg-white bg-opacity-90 border ${
              passwordError ? 'border-purple-400 bg-purple-50' : 'border-white border-opacity-20'
            } rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 ${
              passwordError ? 'focus:ring-purple-400' : 'focus:ring-cyan-500'
            } focus:border-transparent transition-all duration-200 outline-none backdrop-blur-sm`}
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showPassword ? (
              <Eye className="h-5 w-5" />
            ) : (
              <EyeOff className="h-5 w-5" />
            )}
          </button>
        </div>
        {passwordError && (
          <p className="mt-1.5 text-xs text-purple-400 flex items-center gap-1.5 animate-shake">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{passwordError}</span>
          </p>
        )}
      </div>

      {/* Remember Me Checkbox */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
         <input
    id="remember-me"
    type="checkbox"
    checked={rememberMe}
    onChange={() => setRememberMe(!rememberMe)}
    className="h-4 w-4 text-cyan-500 bg-white bg-opacity-10 
               border-white border-opacity-20 rounded focus:ring-cyan-500 cursor-pointer"
/>
          <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300 cursor-pointer">
            Remember me
          </label>
        </div>
      </div>

      

      {/* Login Button */}
      <button
        onClick={handleLogin}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-cyan-500/50 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Signing in...
          </>
        ) : (
          'Login'
        )}
      </button>

      {/* Forgot Password Link */}
      <div className="text-center pt-2">
        <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
          Forgot your password?
        </a>
      </div>
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}