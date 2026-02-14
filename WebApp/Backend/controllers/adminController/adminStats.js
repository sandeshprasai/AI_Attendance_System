const students = require("../../models/students");
const teachers = require("../../models/teachers");
const AcademicClass = require("../../models/accademicClass");
const logger = require("../../logger/logger");

/**
 * Get total students count
 */
const getTotalStudents = async (req, res) => {
  try {
    logger.info(`Fetch total students count | IP: ${req.ip}`);

    const total = await students.countDocuments();

    logger.info(`Total students: ${total} | IP: ${req.ip}`);

    return res.status(200).json({
      success: true,
      message: "Total students count fetched successfully",
      data: { total },
    });
  } catch (error) {
    logger.error(
      `Failed to fetch total students | Error: ${error.message} | IP: ${req.ip}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching students count",
    });
  }
};

/**
 * Get total teachers count
 */
const getTotalTeachers = async (req, res) => {
  try {
    logger.info(`Fetch total teachers count | IP: ${req.ip}`);

    const total = await teachers.countDocuments();

    logger.info(`Total teachers: ${total} | IP: ${req.ip}`);

    return res.status(200).json({
      success: true,
      message: "Total teachers count fetched successfully",
      data: { total },
    });
  } catch (error) {
    logger.error(
      `Failed to fetch total teachers | Error: ${error.message} | IP: ${req.ip}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching teachers count",
    });
  }
};

/**
 * Get total classrooms count (from physical classroom table, not academic classes)
 */
const getTotalClassrooms = async (req, res) => {
  try {
    logger.info(`Fetch total classrooms count | IP: ${req.ip}`);

    // Count all academic classes (active + completed + archived)
    const total = await AcademicClass.countDocuments();

    logger.info(`Total classrooms (academic classes): ${total} | IP: ${req.ip}`);

    return res.status(200).json({
      success: true,
      message: "Total classrooms count fetched successfully",
      data: { total },
    });
  } catch (error) {
    logger.error(
      `Failed to fetch total classrooms | Error: ${error.message} | IP: ${req.ip}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching classrooms count",
    });
  }
};

/**
 * Get active classes count
 */
const getActiveClasses = async (req, res) => {
  try {
    logger.info(`Fetch active classes count | IP: ${req.ip}`);

    // Count only active academic classes (Note: field is "Status" with capital S)
    const active = await AcademicClass.countDocuments({ Status: "active" });

    logger.info(`Active classes: ${active} | IP: ${req.ip}`);

    return res.status(200).json({
      success: true,
      message: "Active classes count fetched successfully",
      data: { active },
    });
  } catch (error) {
    logger.error(
      `Failed to fetch active classes | Error: ${error.message} | IP: ${req.ip}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching active classes count",
    });
  }
};

/**
 * Get system status (database connection)
 */
const getSystemStatus = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    
    return res.status(200).json({
      success: true,
      message: "System status fetched successfully",
      data: {
        database: {
          status: dbStatus,
          connected: mongoose.connection.readyState === 1,
        },
      },
    });
  } catch (error) {
    logger.error(
      `Failed to fetch system status | Error: ${error.message} | IP: ${req.ip}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching system status",
    });
  }
};

module.exports = {
  getTotalStudents,
  getTotalTeachers,
  getTotalClassrooms,
  getActiveClasses,
  getSystemStatus,
};
