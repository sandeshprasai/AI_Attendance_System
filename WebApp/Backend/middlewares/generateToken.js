const jwt = require("jsonwebtoken");
require("dotenv").config();
const generateToken = (payload, rememberMe) => {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
  const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, {
    expiresIn: rememberMe ? process.env.REFRESH_EXPIRY : "1d",
  });

  return { accessToken, refreshToken };
};

module.exports = generateToken;
