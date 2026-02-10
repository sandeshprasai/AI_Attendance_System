const express = require("express");
const attendanceRoutes = express.Router();
const { saveAttendance, getAttendanceByClass } = require("../controllers/attendanceController/saveAttendance");
const allowTeacherAndAdmin = require("../middlewares/teacherAdminAccessControl");

// Save attendance
attendanceRoutes.post("/", allowTeacherAndAdmin, saveAttendance);

// Get attendance history for a class
attendanceRoutes.get("/class/:classId", allowTeacherAndAdmin, getAttendanceByClass);

module.exports = attendanceRoutes;
