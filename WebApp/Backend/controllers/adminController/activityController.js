const ActivityLog = require('../../models/activityLog');
const logger = require('../../logger/logger');

// Get recent activities with pagination
const getRecentActivities = async (req, res) => {
  try {
    const { limit = 10, page = 1, type } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const query = type ? { activityType: type } : {};
    
    // Don't populate for now - just get the activities
    const activities = await ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limitNum)
      .skip(skip)
      .lean();

    const totalCount = await ActivityLog.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: totalPages,
        hasMore: pageNum < totalPages
      }
    });
  } catch (error) {
    logger.error('Error fetching recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activities',
      error: error.message
    });
  }
};

// Get activities by type
const getActivitiesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    const activities = await ActivityLog.find({ activityType: type })
      .populate('performedBy', 'name email role')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const totalCount = await ActivityLog.countDocuments({ activityType: type });

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: totalCount > (parseInt(skip) + parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error fetching activities by type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
      error: error.message
    });
  }
};

// Get activities statistics
const getActivityStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await ActivityLog.aggregate([
      {
        $facet: {
          todayActivities: [
            { $match: { timestamp: { $gte: today } } },
            { $count: 'count' }
          ],
          totalActivities: [
            { $count: 'count' }
          ],
          activitiesByType: [
            { $group: { _id: '$activityType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          recentByHour: [
            {
              $match: {
                timestamp: {
                  $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                }
              }
            },
            {
              $group: {
                _id: { $hour: '$timestamp' },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        todayCount: stats[0].todayActivities[0]?.count || 0,
        totalCount: stats[0].totalActivities[0]?.count || 0,
        byType: stats[0].activitiesByType,
        hourlyDistribution: stats[0].recentByHour
      }
    });
  } catch (error) {
    logger.error('Error fetching activity stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity statistics',
      error: error.message
    });
  }
};

// Create activity log (helper for other controllers)
const createActivityLog = async (activityData) => {
  try {
    const activity = new ActivityLog(activityData);
    await activity.save();
    return activity;
  } catch (error) {
    logger.error('Error creating activity log:', error);
    throw error;
  }
};

// Get activities by date range
const getActivitiesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, limit = 50, skip = 0 } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const query = {
      timestamp: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    const activities = await ActivityLog.find(query)
      .populate('performedBy', 'name email role')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const totalCount = await ActivityLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: totalCount > (parseInt(skip) + parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error fetching activities by date range:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
      error: error.message
    });
  }
};

// Delete old activities (cleanup)
const deleteOldActivities = async (req, res) => {
  try {
    const { days = 90 } = req.query;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const result = await ActivityLog.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} old activity logs`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    logger.error('Error deleting old activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete old activities',
      error: error.message
    });
  }
};

module.exports = {
  getRecentActivities,
  getActivitiesByType,
  getActivityStats,
  createActivityLog,
  getActivitiesByDateRange,
  deleteOldActivities
};
