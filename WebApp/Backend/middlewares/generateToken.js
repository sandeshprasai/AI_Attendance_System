const jwt = require("jsonwebtoken");
require("dotenv").config();
const logger = require("./../logger/logger");

const generateToken = (payload, rememberMe) => {
  try {
    const accessSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.REFRESH_SECRET;

    if (!accessSecret || !refreshSecret) {
      throw new Error("JWT_SECRET or REFRESH_SECRET not defined");
    }

    const accessToken = jwt.sign(payload, accessSecret, {
      expiresIn: process.env.JWT_EXPIRY || "15m",
    });
    logger.info(`JWT access token issued for user ID: ${payload.id}`);

    let refreshToken = null;

    if (rememberMe) {
      refreshToken = jwt.sign(payload, refreshSecret, {
        expiresIn: process.env.REFRESH_EXPIRY || "7d",
      });
    } else {
      refreshToken = jwt.sign(payload, refreshSecret, {
        expiresIn: "1d",
      });
    }

    logger.info(`JWT refresh token issued for user ID: ${payload.id}`);

    return { accessToken, refreshToken };
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error generating tokens:", error);
    logger.error("Error while creating refresh token");
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

module.exports = generateToken;
