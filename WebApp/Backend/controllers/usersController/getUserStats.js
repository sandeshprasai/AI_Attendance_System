const User = require("../../models/users");
const logger = require("../../logger/logger"); // Import Winston logger

const getUserStats = async (req, res) => {
  const clientIp = req.ip;
  const userId = req.user ? req.user.id : "guest"; // If JWT middleware sets req.user

  logger.info(
    `GET_USER_STATS request received - userId: ${userId}, IP: ${clientIp}`,
  );

  try {
    // Count users by role
    const counts = await User.aggregate([
      {
        $group: {
          _id: "$role",
          total: { $sum: 1 },
        },
      },
    ]);

    // Default counts
    const stats = {
      student: 0,
      teacher: 0,
      admin: 0,
    };

    counts.forEach((c) => {
      stats[c._id] = c.total;
    });
    console.log(stats);
    logger.info(
      `User stats computed successfully - userId: ${userId}, stats: ${JSON.stringify(
        stats,
      )}`,
    );

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (err) {
    logger.error(
      `GET_USER_STATS error - userId: ${userId}, IP: ${clientIp}, message: ${
        err.stack || err
      }`,
    );
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = getUserStats;
