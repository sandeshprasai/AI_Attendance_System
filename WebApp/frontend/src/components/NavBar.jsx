import { useState, useRef, useEffect } from "react";
import { User, Settings, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";


function NavBar({ links }) {
  const { user, setUser } = useAuth(); // 🔥 Now using global auth state
  const navigate = useNavigate();

  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const menuRef = useRef(null);

  // 🔥 Default links (same as before)
  const navLinks = links || [
    { label: "Home", to: "/admin-dashboard" },
    { label: "Add Student", to: "/add-student" },
    { label: "Add Teacher", to: "/add-teacher" },
    { label: "Create Classroom", to: "/create-classroom" },
  ];

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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-cyan-600 to-teal-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
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
              <h1 className="text-xl font-bold text-yellow-300">
                SmartAttendanceSystem
              </h1>
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
                  className={`w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 hover:shadow-lg active:scale-95 overflow-hidden ${
                    showLogoutMenu
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
                      className={`w-5 h-5 text-cyan-600 transition-transform duration-300 ${
                        showLogoutMenu ? "rotate-12" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Dropdown */}
                <div
                  className={`absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-out origin-top-right ${
                    showLogoutMenu
                      ? "opacity-100 scale-100 translate-y-0"
                      : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                  }`}
                >
                  {/* User Info */}
                  <div className="px-4 py-4 bg-gradient-to-r from-cyan-50 to-teal-50 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-md overflow-hidden">
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

                  {/* Settings Button */}
                  <div className="py-2">
                    <button
                      onClick={() =>
                        toast.success("Settings feature coming soon!")
                      }
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-all duration-200 active:scale-95"
                    >
                      <Settings className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Settings</span>
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
    </>
  );
}

export default NavBar;