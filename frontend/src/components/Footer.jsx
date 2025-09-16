import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.textBlock}>
          <p style={styles.title}>&copy; {currentYear} Advanced Attendance System</p>
          <p style={styles.subtitle}>Developed by:</p>
          <ul style={styles.teamList}>
            <li>Kiran Dhakal</li>
            <li>Santu Yadav</li>
            <li>Sandesh Prasai</li>
            <li>Saurab Ghimire</li>
          </ul>
        </div>
        <div style={styles.socialBlock}>
          <p style={styles.subtitle}>Follow us:</p>
          <div style={styles.socialIcons}>
            <a href="#" style={styles.icon}>🌐</a>
            <a href="#" style={styles.icon}>🐦</a>
            <a href="#" style={styles.icon}>💼</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: "#1f2a38",
    color: "#ffffff",
    padding: "2rem 1rem",
    textAlign: "center",
    fontFamily: "'Arial', sans-serif",
    boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1.5rem",
  },
  textBlock: {},
  title: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    marginBottom: "0.3rem",
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "#cfd8dc",
    marginBottom: "0.5rem",
  },
  teamList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
    justifyContent: "center",
    fontSize: "0.9rem",
  },
  socialBlock: {},
  socialIcons: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
  },
  icon: {
    fontSize: "1.2rem",
    color: "#ffffff",
    textDecoration: "none",
    transition: "color 0.3s",
  },
};

export default Footer;