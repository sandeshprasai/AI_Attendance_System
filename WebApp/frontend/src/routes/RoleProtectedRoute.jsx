import { Navigate } from "react-router-dom";

export default function RoleProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
  const role = localStorage.getItem("role") || sessionStorage.getItem("role");

  // Not logged in
  if (!token) return <Navigate to="/" replace />;

  // Role mismatch
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}