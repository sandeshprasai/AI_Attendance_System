import { useState } from "react";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "../context/AuthContext"; // import hook

export default function LoginPage() {
  const { setUser } = useAuth(); // get context setter

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState(""); // Added this
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  // Handle username change with validation
  const handleUsernameChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
    setUsername(value);
    if (value && value.length < 3) {
      setUsernameError("Username must be at least 3 characters");
    } else {
      setUsernameError("");
    }
  };

  // Handle password change with validation
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    if (value && value.length < 6) {
      setPasswordError("Password must be at least 6 characters");
    } else {
      setPasswordError("");
    }
  };

  const handleLogin = async () => {
    let hasError = false;


    // Validate username
    if (!username) {
      setUsernameError("Username is required");
      hasError = true;
    } else if (username.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      hasError = true;
    }

    // Validate password
    if (!password) {
      setPasswordError("Password is required");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      hasError = true;
    }

    if (hasError) return;

    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, rememberMe }),
      });

      const data = await response.json();
      setIsLoading(false);

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // -----🔥 STORE LOGIN DATA -----
      const storage = rememberMe ? localStorage : sessionStorage;

      storage.setItem("accessToken", data.accessToken);
      storage.setItem("refreshToken", data.refreshToken);
      storage.setItem("userId", data.user.id);
      storage.setItem("username", data.user.username);
      storage.setItem("name", data.user.name);
      storage.setItem("role", data.user.role);

      // Store Cloudinary URL directly
      storage.setItem("ProfileImageURL", data.user.ProfileImagePath);

      // -----🔥 UPDATE CONTEXT -----
      setUser({
        id: data.user.id,
        name: data.user.name,
        username: data.user.username,
        role: data.user.role,
        photoURL: data.user.ProfileImagePath, // DIRECT Cloudinary URL
      });

      // -----🔥 REDIRECT BASED ON ROLE -----
      const role = data.user.role;

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* Username Field */}
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-slate-300 mb-2"
        >
          Username:
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={handleUsernameChange}
          onKeyDown={handleKeyDown}
          className={`block w-full px-3 py-3 bg-white bg-opacity-90 border ${usernameError
            ? "border-purple-400 bg-purple-50"
            : "border-white border-opacity-20"
            } rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 ${usernameError ? "focus:ring-purple-400" : "focus:ring-cyan-500"
            } focus:border-transparent transition-all duration-200 outline-none backdrop-blur-sm`}
          placeholder="Enter username"
        />
        {usernameError && (
          <p className="mt-1.5 text-xs text-purple-400 flex items-center gap-1.5 animate-shake">
            <svg
              className="w-3.5 h-3.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{usernameError}</span>
          </p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-300 mb-2"
        >
          Password:
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-slate-400" />
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={handlePasswordChange}
            onKeyDown={handleKeyDown}
            className={`block w-full px-3 py-3 bg-white bg-opacity-90 border  ${passwordError
              ? "border-purple-400 bg-purple-50"
              : "border-white border-opacity-20"
              } rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 ${passwordError ? "focus:ring-purple-400" : "focus:ring-cyan-500"
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
            <svg
              className="w-3.5 h-3.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
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
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-slate-300 cursor-pointer"
          >
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
          "Login"
        )}
      </button>

      {/* Forgot Password Link */}
      <div className="text-center pt-2">
        <Link
          to="/forget-password"
          className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
        >
          Forgot your password?
        </Link>
      </div>

      <style>
        {`
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }
    
    .animate-shake {
      animation: shake 0.3s ease-in-out;
    }
  `}
      </style>
    </div>
  );
}
