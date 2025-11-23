const express = require("express");
const userRouter = express.Router();
const sanitizeStudenstInput = require("./../middlewares/sanitizeStudentsInput");
const addStudent = require("./../controllers/usersController/addStudents");

userRouter.get("/", (req, res) => {
  res.send("You are on user routes");
});

userRouter.post("/students", sanitizeStudenstInput,addStudent);

module.exports = userRouter;
