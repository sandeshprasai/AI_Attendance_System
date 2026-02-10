const jwt = require("jsonwebtoken");
const generateToken = require("./../../middlewares/generateToken");
const logger = require("./../../logger/logger");

const refreshTokenController = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    const refreshSecret = process.env.REFRESH_SECRET;
    
    if (!refreshSecret) {
      throw new Error("REFRESH_SECRET not defined");
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, refreshSecret);

    // Generate new access token with same payload
    const payload = {
      id: decoded.id,
      name: decoded.name,
      username: decoded.username,
      role: decoded.role,
      ProfileImagePath: decoded.ProfileImagePath,
    };

    const accessSecret = process.env.JWT_SECRET;
    const newAccessToken = jwt.sign(payload, accessSecret, {
      expiresIn: process.env.JWT_EXPIRY || "15m",
    });

    logger.info(`Access token refreshed for user ID: ${decoded.id}`);

    return res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    logger.error(`Refresh token verification failed: ${error.message}`);
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Refresh token expired" });
    }
    
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

module.exports = refreshTokenController;
