const allowStudentOnly = (req, res, next) => {
  if (req.user && req.user.role === "student") {
    return next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Students only.",
    });
  }
};

module.exports = allowStudentOnly;
