const users = require("./../../models/users");
const bcryptjs = require("bcryptjs");
const generateToken = require("./../../middlewares/generateToken");

const loginController = async (req, res) => {
  const { username, password, rememberMe } = req.body;

  try {
    const user = await users.findOne({ username });

    if (!user) {
      return res.status(400).json({
        message: "User with provided credentials is not registered",
      });
    }

    const match = await bcryptjs.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid Password" });
    }

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
