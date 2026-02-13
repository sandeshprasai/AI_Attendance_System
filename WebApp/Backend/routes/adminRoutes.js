const express = require("express");
const adminStatsRoutes = express.Router();

const {
  getTotalStudents,
  getTotalTeachers,
  getTotalClassrooms,
  getActiveClasses,
  getSystemStatus,
} = require("../controllers/adminController/adminStats");

const {
  getAllStudents,
  getStudentById,
  getRecentlyAddedStudents,
  getStudentsWithoutEmbeddings,
  getStudentManagementStats,
} = require("../controllers/adminController/studentsController");

const {
  getAllTeachers,
  getTeacherById,
  getRecentlyAddedTeachers,
  getActiveTeachers,
  getTeacherManagementStats,
} = require("../controllers/adminController/teachersController");

const preventAccess = require("../middlewares/adminAccessControl");

// Admin statistics routes
adminStatsRoutes.get("/stats/students", preventAccess, getTotalStudents);
adminStatsRoutes.get("/stats/teachers", preventAccess, getTotalTeachers);
adminStatsRoutes.get("/stats/classrooms", preventAccess, getTotalClassrooms);
adminStatsRoutes.get("/stats/active-classes", preventAccess, getActiveClasses);
adminStatsRoutes.get("/system-status", preventAccess, getSystemStatus);

// Students management routes
adminStatsRoutes.get("/students", preventAccess, getAllStudents);
adminStatsRoutes.get("/students/:id", preventAccess, getStudentById);
adminStatsRoutes.get("/students-recent", preventAccess, getRecentlyAddedStudents);
adminStatsRoutes.get("/students-pending", preventAccess, getStudentsWithoutEmbeddings);
adminStatsRoutes.get("/student-management-stats", preventAccess, getStudentManagementStats);

// Teachers management routes
adminStatsRoutes.get("/teachers", preventAccess, getAllTeachers);
adminStatsRoutes.get("/teachers/:id", preventAccess, getTeacherById);
adminStatsRoutes.get("/teachers-recent", preventAccess, getRecentlyAddedTeachers);
adminStatsRoutes.get("/teachers-active", preventAccess, getActiveTeachers);
adminStatsRoutes.get("/teacher-management-stats", preventAccess, getTeacherManagementStats);

module.exports = adminStatsRoutes;
