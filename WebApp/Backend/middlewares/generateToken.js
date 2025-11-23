const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (payload, rememberMe) => {
  const accessSecret = process.env.JWT_SECRET;
  const refreshSecret = process.env.REFRESH_SECRET;

  if (!accessSecret || !refreshSecret) {
    throw new Error("JWT_SECRET or REFRESH_SECRET not defined");
  }

  const accessToken = jwt.sign(payload, accessSecret, {
    expiresIn: process.env.JWT_EXPIRY || "15m",
  });
  const refreshToken = jwt.sign(payload, refreshSecret, {
    expiresIn: rememberMe ? process.env.REFRESH_EXPIRY || "7d" : "1d",
  });

  return { accessToken, refreshToken };
};

module.exports = generateToken;
