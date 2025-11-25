const express = require("express");
const { loginController, getCurrentUser } = require("../controllers/authcontroller/loginController");
const sanitizeLoginInput = require("../middlewares/sanitizeLoginInput");
const authMiddleware = require("../middlewares/authMiddleware");

const authRouter = express.Router();

authRouter.get("/", (req, res) => {
  res.send("Auth route working");
});

authRouter.post("/login", sanitizeLoginInput, loginController);
authRouter.get("/me", authMiddleware, getCurrentUser);


module.exports = authRouter;