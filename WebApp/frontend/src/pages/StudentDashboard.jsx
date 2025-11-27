
import React from "react";

const AdminDashboard = () => {
  console.log(localStorage.getItem("role")) // Ensure role is 'Student' for this dashboard
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to the Student Dashboard!</h1>
      <p>You are logged in as an Student.</p>
    </div>
  );
};

export default AdminDashboard;