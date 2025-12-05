const User = require("../../models/users");

const getUserStats = async (req, res) => {
  try {
    // Count users by role
    const counts = await User.aggregate([
      {
        $group: {
          _id: "$role",
          total: { $sum: 1 }
        }
      }
    ]);

    // Default counts
    const stats = {
      student: 0,
      teacher: 0,
      admin: 0
    };

    counts.forEach(c => {
      stats[c._id] = c.total;
    });

    res.status(200).json({
      success: true,
      stats
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = getUserStats;