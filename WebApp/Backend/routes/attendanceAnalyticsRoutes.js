const express = require('express');
const router = express.Router();
const { 
  getTodayAttendanceAnalytics, 
  getAbsentStudentsList,
  getTeacherTodayAttendanceAnalytics,
  getTeacherClassBreakdown
} = require('../controllers/adminController/attendanceAnalyticsController');
const preventAccess = require('../middlewares/adminAccessControl');
const allowTeacherAndAdmin = require('../middlewares/teacherAdminAccessControl');

// Admin-only routes
router.get('/today', preventAccess, getTodayAttendanceAnalytics);
router.get('/absent-students', preventAccess, getAbsentStudentsList);

// Teacher & Admin routes
router.get('/teacher/today', allowTeacherAndAdmin, getTeacherTodayAttendanceAnalytics);
router.get('/teacher/class-breakdown', allowTeacherAndAdmin, getTeacherClassBreakdown);

module.exports = router;
