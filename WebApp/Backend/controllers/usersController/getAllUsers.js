const User = require("../../models/users");
const logger = require("../../logger/logger"); // Import Winston logger

const getAllUsers = async (req, res) => {
  let { page = 1, limit = 20, role, search } = req.query;
  const clientIp = req.ip;

  logger.info(`GET_ALL_USERS request received - IP: ${clientIp}, query: ${JSON.stringify(req.query)}`);

  try {
    page = Math.max(parseInt(page), 1);
    limit = Math.min(Math.max(parseInt(limit), 1), 100);
    const skip = (page - 1) * limit;

    const filter = {};

    if (role) {
      filter.role = new RegExp(`^${role.trim()}$`, "i");
      logger.info(`Filter applied: role = ${role}`);
    }

    if (search) {
      const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [{ name: regex }, { username: regex }];
      logger.info(`Filter applied: search = ${search}`);
    }

    const total = await User.countDocuments(filter);
    logger.info(`Total users found: ${total}`);

    const users = await User.find(filter)
      .select("name username role ProfileImagePath createdAt updatedAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    logger.info(`Returning page ${page} with ${users.length} users`);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      users,
    });
  } catch (err) {
    logger.error(`GET_ALL_USERS error - IP: ${clientIp}, message: ${err.stack || err}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = getAllUsers;
