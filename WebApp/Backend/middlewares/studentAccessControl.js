const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Middleware to allow access for student role only
 */
const allowStudentOnly = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(403).json({ message: "Unauthorized Access" });
  }

  // Expect "Bearer token"
  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(403).json({ message: "Invalid Authorization Format" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Allow only students
    if (decoded.role !== "student") {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. Students only." 
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.log("JWT ERROR:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = allowStudentOnly;
