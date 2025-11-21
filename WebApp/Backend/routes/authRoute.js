const express = require("express");
const loginConotroller = require("./../controllers/authcontroller/loginController");
const sanitizeLoginInput = require("./../middlewares/sanitizeLoginInput");
const authRouter = express.Router();

authRouter.get("/", () => {
  console.log("In auth route");
});

authRouter.post("/login", sanitizeLoginInput, loginConotroller);

module.exports = authRouter;
