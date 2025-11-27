const express = require("express");
const userRouter = express.Router();
const sanitizeStudenstInput = require("./../middlewares/sanitizeStudentsInput");
const addStudent = require("./../controllers/usersController/addStudents");
const uploadFile = require("./../middlewares/profileImageHelper");

userRouter.get("/", (req, res) => {
  res.send("You are on user routes");
});

userRouter.post("/students", uploadFile, sanitizeStudenstInput, addStudent);

module.exports = userRouter;
