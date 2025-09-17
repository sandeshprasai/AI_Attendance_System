import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.link}>Home</Link>
      <Link to="/login" style={styles.link}>Login</Link>
      
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "center",
    gap: "2rem",
    padding: "1rem",
    backgroundColor: "#2c3e50",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    fontWeight: "bold",
  },
};

export default Navbar;