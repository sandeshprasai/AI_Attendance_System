import React from "react";

const footerStyle = {
  width: "100%",
  padding: "1rem 0",
  background: "#2d3436",
  color: "#fff",
  textAlign: "center",
  position: "fixed",
  left: 0,
  bottom: 0,
};

function Footer() {
  return (
    <footer style={footerStyle}>
      © {new Date().getFullYear()} Advanced Attendance System. All rights reserved.
    </footer>
  );
}

export default Footer;