const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Middleware to allow access for both admin and teacher roles
 */
const allowTeacherAndAdmin = (req, res, next) => {
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

    // Allow both admin and teacher
    if (decoded.role !== "admin" && decoded.role !== "teacher") {
      return res.status(403).json({ message: "Unauthorized Access. Admin or Teacher role required." });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.log("JWT ERROR:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = allowTeacherAndAdmin;
