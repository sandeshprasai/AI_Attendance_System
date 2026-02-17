const express = require('express');
const studentDashboardRoutes = express.Router();
const {
  getStudentOverallStats,
  getStudentRecentAbsences,
  getStudentClassWiseAttendance,
  getStudentClasses,
  getStudentClassesWithAttendance
} = require('../controllers/studentController/studentDashboardController');
const allowStudentOnly = require('../middlewares/studentAccessControl');

// Student dashboard endpoints (only accessible by students)
studentDashboardRoutes.get('/overall-stats', allowStudentOnly, getStudentOverallStats);
studentDashboardRoutes.get('/recent-absences', allowStudentOnly, getStudentRecentAbsences);
studentDashboardRoutes.get('/class-wise-attendance', allowStudentOnly, getStudentClassWiseAttendance);
studentDashboardRoutes.get('/my-classes', allowStudentOnly, getStudentClasses);
studentDashboardRoutes.get('/my-classes-detailed', allowStudentOnly, getStudentClassesWithAttendance);

module.exports = studentDashboardRoutes;
