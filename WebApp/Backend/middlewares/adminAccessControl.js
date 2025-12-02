const jwt = require("jsonwebtoken");
require("dotenv").config();

const preventAccess = (req, res, next) => {
  const authHeader = req.headers.authorization?.trim();
  if (!authHeader) {
    return res.status(403).json({ message: "Unauthorized Access" });
  }

  try {
    const decoded = jwt.verify(authHeader, process.env.JWT_SECRET);
  
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized Access" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.log("JWT ERROR:", error);
    return res.status(500).json({ message: "Invalid or expired token" });
  }
};

module.exports = preventAccess;

