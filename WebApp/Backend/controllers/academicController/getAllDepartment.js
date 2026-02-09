const Departments = require("../../models/department");
const logger = require("../../logger/logger");
const { log } = require("winston");

const getAllDepartment = async (req, res) => {
  logger.info(` Received Request to fetch Department form ${req.ip} `);
  try {
    const departments = await Departments.find(
      {},
      { _id: 1, DepartmentName: 1, DepartmentCode: 1 }
    ).lean();
    console.log(departments)
    if (!Array.isArray(departments) || departments.length == 0) {
      logger.warn("No Departments found in database");
      return res
        .status(200)
        .json({ success: true, Departments: "No Departments Found", data: [] });
    }
    logger.info(`Sucessfully Fetched ${departments.length} departments `);
    return res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    logger.error(
      `An error occured while fetching the departments | ${error.message} `,
      { stack: error.stack }
    );
    return res
      .status(500)
      .json({
        success: false,
        error: "Internal Server Error.Please Try again later ",
      });
  }
};

module.exports = getAllDepartment;
