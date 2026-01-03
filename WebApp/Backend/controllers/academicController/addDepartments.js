const Department = require("../../models/department");
const logger = require("../../logger/logger");

const addDepartment = async (req, res) => {
  try {
    const departments = req.body; // Expecting an array of departments

    if (!Array.isArray(departments) || departments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body must be an array of departments.",
      });
    }

    // Loop through each department and check for duplicates
    for (const department of departments) {
      const { DepartmentCode, DepartmentName } = department;

      if (!DepartmentCode || !DepartmentName) {
        return res.status(400).json({
          success: false,
          message: "DepartmentCode and DepartmentName are required for each department.",
        });
      }

      logger.info(`Add Department request | Code: ${DepartmentCode} | IP: ${req.ip}`);

      // Check for existing department by DepartmentCode
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
    }

    // Create departments in bulk
    const createdDepartments = await Department.insertMany(departments);

    logger.info(
      `Departments created successfully | Count: ${createdDepartments.length}`
    );

    return res.status(201).json({
      success: true,
      message: `${createdDepartments.length} departments created successfully`,
      data: createdDepartments,
    });
  } catch (error) {
    logger.error(
      `Add Departments failed | Error: ${error.message} | IP: ${req.ip}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating departments",
    });
  }
};

module.exports = addDepartment;
