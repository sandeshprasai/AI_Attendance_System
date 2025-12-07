const express = require("express");
const userRouter = express.Router();

// Middlewares
const preventAccess = require("./../middlewares/adminAccessControl");
const uploadFile = require("./../middlewares/profileImageHelper");
const sanitizeStudentInput = require("./../middlewares/sanitizeStudentsInput");
const sanitizeTeacherInput = require("./../middlewares/sanitizeTeacherInputs");

// Controllers
const addStudent = require("./../controllers/usersController/addStudents");
const addTeacher = require("./../controllers/usersController/addTeachers");
const getUserStats = require("./../controllers/usersController/getUserStats");
const getAllUsers = require("./../controllers/usersController/getAllUsers");

// Test Route
userRouter.get("/", (req, res) => {
  res.send("You are on user routes");
});

// Student Routes
userRouter.post(
  "/students",
  preventAccess,
  uploadFile,
  sanitizeStudentInput,
  addStudent
);

// Teacher Routes
userRouter.post(
  "/teachers",
  preventAccess,
  uploadFile,
  sanitizeTeacherInput,
  addTeacher
);

// Stats
userRouter.get("/stats", preventAccess, getUserStats);

// Get All Users
userRouter.get("/all", preventAccess, getAllUsers);

module.exports = userRouter;
