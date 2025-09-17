import React,{ useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  const [message, setMessage] = useState("");
   useEffect(() => {
    fetch("http://localhost:5001/")
      .then((res) => res.text())
      .then((data) => setMessage(data));
  }, []);
  

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
       <div>
      <p>{message}</p>
    </div>
      <Footer />
    </Router>
  );
}

export default App;