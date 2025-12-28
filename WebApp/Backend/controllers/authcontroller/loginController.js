const users = require("./../../models/users");
const bcryptjs = require("bcryptjs");
const generateToken = require("./../../middlewares/generateToken");
const logger = require("./../../logger/logger");

const loginController = async (req, res) => {
  const { username, password, rememberMe } = req.body;

  logger.info(`Login attempt from IP: ${req.ip}, username: ${username}`);
  try {
    const user = await users.findOne({ username });

    if (!user) {
      logger.warn(
        `Login failed: invalid username (${username}) from ${req.ip}`
      );

      return res.status(400).json({
        message: "User with provided credentials is not registered",
      });
    }

    const match = await bcryptjs.compare(password, user.password);
    if (!match) {
      logger.warn(
        `Login failed: wrong password for ${username} from ${req.ip}`
      );

      return res.status(400).json({ message: "Invalid Password" });
    }
    logger.info(`Login success for user: ${username}, IP: ${req.ip}`);

    // Payload with UI data
    const payload = {
      id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,

      ProfileImagePath: user.ProfileImagePath,
    };

    const { accessToken, refreshToken } = generateToken(payload, rememberMe);

    return res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        name: user.name,
        username: user.username,
        role: user.role,
        ProfileImagePath: user.ProfileImagePath,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { loginController };
