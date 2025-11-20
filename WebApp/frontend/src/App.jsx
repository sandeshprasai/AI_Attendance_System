import React from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

function App() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column"
    }}>
      <NavBar />
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f6fa"
      }}>
        <h1>Welcome to the Attendance System!</h1>
        <p>
          We’re glad to have you here. Please have patience, System is under development.
        </p>
      </div>
      <Footer />
    </div>
  );
}

export default App;