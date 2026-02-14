import { useState, useRef, useEffect } from "react";
import { User, Settings, LogOut, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";


function NavBar({ links }) {
  const { user, setUser } = useAuth(); // 🔥 Now using global auth state
  const navigate = useNavigate();

  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const menuRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL;

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      setIsChangingPassword(true);
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

      const response = await fetch(`${API_URL}api/v1/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          oldpassword: oldPassword,
          newpassword: newPassword,
          confirmpassword: confirmPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Password changed successfully");
        setShowPasswordModal(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Optionally logout user to force re-login
      } else {
        toast.error(data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Change password error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleKeyDownChangePassword = (e) => {
    if (e.key === 'Enter' && !isChangingPassword) {
      handleChangePassword();
    }
  };

  // 🔥 Get dashboard route based on user role
  const getDashboardRoute = () => {
    const role = user?.role?.toLowerCase();
    
    switch (role) {
      case 'admin':
      case 'administrator':
        return '/admin-dashboard';
      case 'teacher':
        return '/teacher-dashboard';
      case 'student':
        return '/student-dashboard';
      default:
        return '/';
    }
  };

  // 🔥 Role-based navigation links
  const getNavLinksByRole = () => {
    const role = user?.role?.toLowerCase();
    
    switch (role) {
      case 'admin':
      case 'administrator':
        return [
          { label: "Home", to: "/admin-dashboard" },
          { label: "Add Student", to: "/add-student" },
          { label: "Add Teacher", to: "/add-teacher" },
          { label: "Add Academics", to: "/add-academics" },
          { label: "Academic Classes", to: "/admin/academic-classes" },
        ];
      
      case 'teacher':
        return [
          { label: "Home", to: "/teacher-dashboard" },
          { label: "My Classes", to: "/teacher/my-classes" },
        ];
      
      case 'student':
        return [
          { label: "Home", to: "/student-dashboard" },
          { label: "My Classes", to: "/student/my-classes" },
        ];
      
      default:
        return [];
    }
  };

  const navLinks = links || getNavLinksByRole();

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowLogoutMenu(false);
      }
    };

    if (showLogoutMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLogoutMenu]);

  // Reset image error when URL changes
  useEffect(() => setImageError(false), [user?.photoURL]);

  // 🔥 Improved logout: clears storage + context + redirects
  const handleLogout = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-4 items-center">
          <span className="font-medium text-center">Are you sure you want to logout?</span>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                toast.dismiss(t.id);

                toast
                  .promise(
                    new Promise((resolve) => {
                      setTimeout(() => {
                        localStorage.clear();
                        sessionStorage.clear();
                        setUser(null); // 🔥 Reset global user state
                        resolve();
                      }, 800);
                    }),
                    {
                      loading: "Logging out...",
                      success: "Logged out successfully!",
                      error: "Failed to logout",
                    }
                  )
                  .then(() => {
                    setTimeout(() => navigate("/"), 1000);
                  });
              }}
              className="px-6 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 font-medium"
            >
              Yes, Logout
            </button>

            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-6 py-2 bg-white text-gray-700 text-sm rounded-lg hover:bg-gray-100 border border-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        style: { minWidth: "300px" },
      }
    );
  };

  return (
    <>
      {/* Toaster setup */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            marginTop: "40vh",
            background: "linear-gradient(to right, rgb(8 145 178), rgb(13 148 136))",
            color: "white",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            zIndex: 9999,
          },
        }}
      />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-linear-to-r from-cyan-600 to-teal-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link 
                to={getDashboardRoute()} 
                className="flex items-center gap-3 hover:opacity-90 transition-opacity"
              >
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-cyan-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-yellow-300 hover:text-yellow-200 transition-colors">
                  SmartAttendanceSystem
                </h1>
              </Link>
            </div>

            {/* Nav Links + User Menu */}
            <div className="flex items-center gap-8">
              {/* Nav Links */}
              <div className="hidden md:flex items-center gap-6">
                {navLinks.map((link, i) => (
                  <Link
                    key={i}
                    to={link.to}
                    className="text-white font-medium transition-all duration-300 hover:text-yellow-300 hover:scale-105"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* User Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowLogoutMenu(!showLogoutMenu)}
                  className={`w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 hover:shadow-lg active:scale-95 overflow-hidden ${showLogoutMenu
                    ? "ring-4 ring-white ring-opacity-40 scale-110"
                    : ""
                    }`}
                >
                  {user?.photoURL && !imageError ? (
                    <img
                      src={user.photoURL}
                      alt={user?.name || "User"}
                      onError={() => setImageError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User
                      className={`w-5 h-5 text-cyan-600 transition-transform duration-300 ${showLogoutMenu ? "rotate-12" : ""
                        }`}
                    />
                  )}
                </button>

                {/* Dropdown */}
                <div
                  className={`absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-out origin-top-right ${showLogoutMenu
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                    }`}
                >
                  {/* User Info */}
                  <div className="px-4 py-4 bg-linear-to-r from-cyan-50 to-teal-50 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-md overflow-hidden">
                        {user?.photoURL && !imageError ? (
                          <img
                            src={user.photoURL}
                            onError={() => setImageError(true)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 font-semibold text-sm">
                          {user?.name || "Guest"}
                        </p>
                        <p className="text-gray-700 text-sm">
                          {user?.username || ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Change Password Button */}
                  <div className="py-2">
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-all duration-200 active:scale-95"
                    >
                      <Settings className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Change Password</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-3 transition-all duration-200 active:scale-95"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 p-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-teal-600 p-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-1">Change Password</h2>
              <p className="text-cyan-100 text-sm">Update your account security</p>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Old Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    onKeyDown={handleKeyDownChangePassword}
                    className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors"
                  >
                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onKeyDown={handleKeyDownChangePassword}
                    className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={handleKeyDownChangePassword}
                    className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg hover:shadow-lg hover:opacity-90 font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {isChangingPassword ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Change Password"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default NavBar;