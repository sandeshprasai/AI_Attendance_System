const express = require("express");
const attendanceRoutes = express.Router();
const { 
    saveAttendanceSnapshot,
    finalizeAttendance,
    saveAttendance, 
    getAttendanceByClass,
    getAttendanceBySubject,
    getAttendanceSession,
    getStudentAttendanceReport,
} = require("../controllers/attendanceController/saveAttendance");
const allowTeacherAndAdmin = require("../middlewares/teacherAdminAccessControl");

// New snapshot-based attendance endpoints
attendanceRoutes.post("/snapshot", allowTeacherAndAdmin, saveAttendanceSnapshot);
attendanceRoutes.post("/finalize", allowTeacherAndAdmin, finalizeAttendance);

// Legacy endpoint for backward compatibility (save complete attendance at once)
attendanceRoutes.post("/", allowTeacherAndAdmin, saveAttendance);

// Get attendance history for a class
attendanceRoutes.get("/class/:classId", allowTeacherAndAdmin, getAttendanceByClass);

// Get attendance by subject
attendanceRoutes.get("/subject/:subjectId", allowTeacherAndAdmin, getAttendanceBySubject);

// Get specific attendance session details
attendanceRoutes.get("/session/:sessionId", allowTeacherAndAdmin, getAttendanceSession);

// Get student attendance report
attendanceRoutes.get("/student/:studentId", allowTeacherAndAdmin, getStudentAttendanceReport);

module.exports = attendanceRoutes;
