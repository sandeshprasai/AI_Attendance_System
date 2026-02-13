const express = require('express');
const activityRouter = express.Router();

const {
  getRecentActivities,
  getActivitiesByType,
  getActivityStats,
  getActivitiesByDateRange,
  deleteOldActivities
} = require('../controllers/adminController/activityController');

const preventAccess = require('../middlewares/adminAccessControl');

// Get recent activities with optional filters
activityRouter.get('/recent', preventAccess, getRecentActivities);

// Get activity statistics
activityRouter.get('/stats', preventAccess, getActivityStats);

// Get activities by specific type
activityRouter.get('/type/:type', preventAccess, getActivitiesByType);

// Get activities by date range
activityRouter.get('/date-range', preventAccess, getActivitiesByDateRange);

// Delete old activities (cleanup endpoint)
activityRouter.delete('/cleanup', preventAccess, deleteOldActivities);

module.exports = activityRouter;
