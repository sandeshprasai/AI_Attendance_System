import React from "react";

function Footer() {
  return (
    <footer className="w-full py-4 bg-gray-800 text-white text-center">
      © {new Date().getFullYear()} Advanced Attendance System. All rights reserved.
    </footer>
  );
}

export default Footer;