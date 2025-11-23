import React from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const AdminDashboard = () => {
  return (
    // 1. Main container to hold the entire layout
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* 2. Navigation Bar */}
      <NavBar />

      {/* 3. Main Content Container */}
      {/* Key Change: Increased padding to '80px 20px' 
        This means 80px padding on the top and bottom, and 20px on the left and right.
      */}
      <main style={{ 
        flex: 1, 
        padding: '80px 20px', // Increased vertical spacing (top/bottom)
        backgroundColor: '#f4f4f4' 
      }}>
        
        {/* 4. The Card Element (same styles as before for the card look) */}
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#ffffff'
        }}>
          
          {/* Content inside the card */}
          <h1 style={{ color: '#333' }}>Welcome to the Admin Dashboard!</h1>
          <p style={{ color: '#666' }}>You are logged in as an admin.</p>
          
        </div>
      </main>

      {/* 5. Footer */}
      <Footer />
    </div>
  );
};

export default AdminDashboard;