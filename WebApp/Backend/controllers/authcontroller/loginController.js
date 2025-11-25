const users = require("./../../models/users");
const bcryptjs = require("bcryptjs");
const generateToken = require("./../../middlewares/generateToken");

const loginController = async (req, res) => {
  console.log(req.body)
  const username = req.body.username;
  const password = req.body.password;
  const rememberMe = req.body.rememberMe;

  try {
    const user = await users.findOne({ email: username });

    if (!user) {
      return res.status(400).json({
        message: "User with the provided credentials is not registered",
      });
    }

    const match = await bcryptjs.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    const { accessToken, refreshToken } = generateToken(payload, rememberMe);
    return res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    console.error(`An error occoured. ${err}`);
    return res.status(500).json({ error: `Internal server error ${err}` });
  }
};
// Returns currently logged-in user
const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by your authentication middleware after verifying token
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Fetch user from DB to get latest info (optional)
    const user = await users.findById(req.user.id).select("name email role photoURL");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {loginController, getCurrentUser};
