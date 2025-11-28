import React from "react";
import { Navigate } from "react-router-dom";

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleProtectedRoute;