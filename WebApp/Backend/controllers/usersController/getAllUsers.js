const User = require("../../models/users");

const getAllUsers = async (req, res) => {
  try {
    let { page = 1, limit = 20, role, search } = req.query;

    page = Math.max(parseInt(page), 1);
    limit = Math.min(Math.max(parseInt(limit), 1), 100);
    const skip = (page - 1) * limit;

    const filter = {};

    // Role filter (case-insensitive)
    if (role) {
      filter.role = new RegExp(`^${role.trim()}$`, "i");
    }

    // Search filter (name or username)
    if (search) {
      const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [{ name: regex }, { username: regex }];
    }

    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select("name username role ProfileImagePath createdAt updatedAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      users
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = getAllUsers;