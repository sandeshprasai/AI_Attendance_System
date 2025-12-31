const Department = require("../../models/department");
const logger = require("../../logger/logger");

const addDepartment = async (req, res) => {
  try {
    const { DepartmentCode, DepartmentName } = req.body;

    logger.info(
      `Add Department request | Code: ${DepartmentCode} | IP: ${req.ip}`
    );

    // Check for existing department
    const existingDepartment = await Department.findOne({ DepartmentCode });
    if (existingDepartment) {
      logger.warn(
        `Duplicate Department | Code: ${DepartmentCode} | IP: ${req.ip}`
      );
      return res.status(409).json({
        success: false,
        message: `Department code ${DepartmentCode} already exists for ${existingDepartment.DepartmentName}`,
      });
    }

    await Department.create({ DepartmentCode, DepartmentName });

    logger.info(
      `Department created successfully | Code: ${DepartmentCode} | Name: ${DepartmentName}`
    );

    return res.status(201).json({
      success: true,
      message: "Department created successfully",
    });
  } catch (error) {
    logger.error(
      `Add Department failed | Error: ${error.message} | IP: ${req.ip}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating department",
    });
  }
};

module.exports = addDepartment;
