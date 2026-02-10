const express = require("express");
const {
  loginController,
  getCurrentUser,
} = require("../controllers/authcontroller/loginController");
const initiatePasswordReset = require("../controllers/authcontroller/initiatePasswordReset");
const resetPassword = require("../controllers/authcontroller/resetPassword");
const changePassword = require("../controllers/authcontroller/changePassword");
const refreshTokenController = require("../controllers/authcontroller/refreshTokenController");
const sanitizeLoginInput = require("../middlewares/sanitizeLoginInput");
const authMiddleware = require("../middlewares/authMiddleware");

const authRouter = express.Router();

authRouter.get("/", (req, res) => {
  res.send("Auth route working");
});

authRouter.post("/login", sanitizeLoginInput, loginController);
authRouter.get("/me", authMiddleware, getCurrentUser); // Get current user profile
authRouter.post("/refresh", refreshTokenController);
authRouter.post("/initiate-reset", initiatePasswordReset);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/change-password", authMiddleware,changePassword);

module.exports = authRouter;
