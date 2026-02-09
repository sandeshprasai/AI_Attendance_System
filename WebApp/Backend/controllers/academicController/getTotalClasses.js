const logger = require("../../logger/logger");
const accademicClass = require("../../models/accademicClass");

const getTotalClasses = async (req, res) => {
  try {
    logger.info(`Count Total class request initated | Req ; ${req.ip}  `);
    const totalClass = await accademicClass.countDocuments({});
    logger.info(`Fetched ${totalClass} Classes  `);

    return res
      .status(200)
      .json({ message: "Total active classes ", data: totalClass });
  } catch (error) {
    logger.error(`Failled to fetch total classes ${error} | Req: ${req.ip}`);
    return res.status(500).json({
      message: "Internal Server Error while fetching total classes ",
      data: [],
    });
  }
};
module.exports = getTotalClasses;
