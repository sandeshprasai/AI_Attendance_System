const express = require("express");
const userRouter = express.Router();
const sanitizeStudenstInput = require("./../middlewares/sanitizeStudentsInput");
const addStudent = require("./../controllers/usersController/addStudents");
const uploadFile = require("./../middlewares/profileImageHelper");
const preventAccess  = require( "./../middlewares/adminAccessControl");
const getUserStats = require("./../controllers/usersController/getUserStats");
const getAllUsers = require("./../controllers/usersController/getAllUsers");

// Test Route

userRouter.get("/", (req, res) => {
  res.send("You are on user routes");
});

userRouter.post("/students",preventAccess, uploadFile, sanitizeStudenstInput, addStudent);
// NEW backend integration routes
userRouter.get("/stats", preventAccess, getUserStats);
userRouter.get("/all", preventAccess, getAllUsers);



module.exports = userRouter;
