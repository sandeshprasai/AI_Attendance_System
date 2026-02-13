const express = require('express');
const router = express.Router();
const { 
  getTodayAttendanceAnalytics, 
  getAbsentStudentsList 
} = require('../controllers/adminController/attendanceAnalyticsController');
const preventAccess = require('../middlewares/adminAccessControl');

// All routes require admin authentication
router.get('/today', preventAccess, getTodayAttendanceAnalytics);
router.get('/absent-students', preventAccess, getAbsentStudentsList);

module.exports = router;
