import React, { useEffect, useState } from "react";
import { Search, Users, ChevronLeft, ChevronRight, Trash2, Mail } from "lucide-react";
import API, { getUserImageURL } from "../utills/api";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

// Replace this with your actual auth context or user state
const getCurrentUser = () => {
  return { role: "superadmin" }; // Mock - replace with actual current user
}; 

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, user: null });
  const [resetModal, setResetModal] = useState({ show: false, user: null });
  
  // Check if current user is super admin
  const currentUser = getCurrentUser();
  const isSuperAdmin = currentUser?.role === "superadmin";

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { page, limit, search, role };
      const { data } = await API.get("/users/all", { params });

      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.pages);
      }
    } catch (err) {
      console.error("Failed fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, role]);

  const handleDeleteUser = async () => {
    if (!deleteModal.user) return;
    
    try {
      const { data } = await API.delete(`/users/${deleteModal.user._id}`);
      
      if (data.success) {
        // Remove user from list
        setUsers(users.filter(u => u._id !== deleteModal.user._id));
        setDeleteModal({ show: false, user: null });
        // Optionally show success message
        alert(data.message || "User deleted successfully");
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Failed to delete user. Please try again.");
    }
  };

  const handleSendResetLink = async () => {
    if (!resetModal.user) return;
    
    try {
      const { data } = await API.post("/users/send-reset-link", {
        userId: resetModal.user._id,
        email: resetModal.user.email || resetModal.user.username
      });
      
      if (data.success) {
        setResetModal({ show: false, user: null });
        alert(data.message || "Password reset link sent successfully");
      }
    } catch (err) {
      console.error("Failed to send reset link:", err);
      alert("Failed to send reset link. Please try again.");
    }
  };

  const getRoleBadgeColor = (userRole) => {
    const colors = {
      admin: "bg-purple-100 text-purple-700 border-purple-200",
      teacher: "bg-blue-100 text-blue-700 border-blue-200",
      student: "bg-green-100 text-green-700 border-green-200"
    };
    return colors[userRole] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Fixed Navbar */}
      <NavBar />
      
      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-auto pt-16"> 
        {/* pt-16 for navbar height, adjust as needed */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">All Users</h1>
              </div>
              <p className="text-gray-600 ml-13">Manage and view all system users</p>
            </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Filters Section */}
          <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or username..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Role Filter */}
              <div className="sm:w-48">
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white cursor-pointer"
                >
                  <option value="">All Roles</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-20">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No users found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Role
                    </th>
                    {isSuperAdmin && (
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr
                      key={u._id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getUserImageURL(u.ProfileImagePath)}
                            alt={u.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                            onError={(e) => (e.target.src = "/default-avatar.png")}
                          />
                          <div>
                            <div className="font-semibold text-gray-900">{u.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{u.username}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(
                            u.role
                          )}`}
                        >
                          {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        </span>
                      </td>
                      {isSuperAdmin && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setResetModal({ show: true, user: u })}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150 group relative"
                              title="Send password reset link"
                            >
                              <Mail className="w-5 h-5" />
                              <span className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Reset Password
                              </span>
                            </button>
                            <button
                              onClick={() => setDeleteModal({ show: true, user: u })}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150 group relative"
                              title="Delete user"
                            >
                              <Trash2 className="w-5 h-5" />
                              <span className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Delete User
                              </span>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && users.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page <span className="font-semibold text-gray-900">{page}</span> of{" "}
                  <span className="font-semibold text-gray-900">{totalPages}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 transition-all"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Delete User</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-900">{deleteModal.user?.name}</span>? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, user: null })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Password Reset Modal */}
        {resetModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Send Password Reset Link</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Send a password reset link to <span className="font-semibold text-gray-900">{resetModal.user?.name}</span>?
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setResetModal({ show: false, user: null })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendResetLink}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send Link
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
     
      </div>
        {/* Footer - Scrollable */}
      <Footer />
      </div>
      
     
    </div>
  );
}