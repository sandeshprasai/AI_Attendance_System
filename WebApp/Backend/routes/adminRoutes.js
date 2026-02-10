const express = require("express");
const adminStatsRoutes = express.Router();

const {
  getTotalStudents,
  getTotalTeachers,
  getTotalClassrooms,
  getActiveClasses,
} = require("../controllers/adminController/adminStats");

const {
  getAllStudents,
  getStudentById,
} = require("../controllers/adminController/studentsController");

const preventAccess = require("../middlewares/adminAccessControl");

// Admin statistics routes
adminStatsRoutes.get("/stats/students", preventAccess, getTotalStudents);
adminStatsRoutes.get("/stats/teachers", preventAccess, getTotalTeachers);
adminStatsRoutes.get("/stats/classrooms", preventAccess, getTotalClassrooms);
adminStatsRoutes.get("/stats/active-classes", preventAccess, getActiveClasses);

// Students management routes
adminStatsRoutes.get("/students", preventAccess, getAllStudents);
adminStatsRoutes.get("/students/:id", preventAccess, getStudentById);

module.exports = adminStatsRoutes;
