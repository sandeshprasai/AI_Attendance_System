import React from "react";

const Home = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>👋 Welcome to Advanced Attendance System using Face Recognition.</h1>
      <p style={styles.text}>
        This application leverages the power of MongoDB, Express.js, React, and Node.js to provide a seamless attendance management experience. Whether you're a student or an educator, our system is designed to make attendance tracking efficient and hassle-free.
      </p>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "80vh",
    textAlign: "center",
  },
  heading: {
    fontSize: "2.5rem",
    marginBottom: "1rem",
  },
  text: {
    fontSize: "1.2rem",
  },
};

export default Home;