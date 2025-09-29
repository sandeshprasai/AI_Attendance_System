import React from 'react';
const navStyle={
    display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1rem 2rem",
  background: "#2d3436",
  color: "#fff",
};
const linkStyle={
    color: "#fff",
  textDecoration: "none",
  margin: "0 1rem",
  fontWeight: "500",
};
function NavBar(){
    return(
        <nav style={navStyle}>
            <div style={{ fontWeight: "bold", font:"1.2rem"}}>
                Advanced Attendance System
            </div>
            <div>
                <a href="/" style={linkStyle}>Home</a>
                <a href="/" style={linkStyle}>About</a>
                
                <a href="/about" style={linkStyle}>Login</a>
                <a href="/" style={linkStyle}>Register</a>

                <a href="/contact" style={linkStyle}>Contact</a>
            </div>

        </nav>
    );

};
export default NavBar;