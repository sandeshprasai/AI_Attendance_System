const { log } = require("winston");
const logger = require("../../logger/logger");
const Subjects = require("../../models/subjects");
const Department = require("../../models/department");

const getAllSubjects = async (req, res) => {
  logger.info(`Received request to fetch Subjects from IP: ${req.ip}`);

  const DepartmentName = req.query.DepartmentName;

  if (!DepartmentName || !DepartmentName.trim()) {
    logger.warn("DepartmentName query param missing");
    return res.status(400).json({
      success: false,
      message: "DepartmentName query parameter is required",
      data: []
    });
  }

  const trimmedDepartmentName = DepartmentName.trim();

  try {
    const findDepartmentID = await Department.findOne(
      { DepartmentName: trimmedDepartmentName },
      { _id: 1 }
    );

    if (!findDepartmentID) {
      logger.warn(`Invalid Department: ${trimmedDepartmentName}`);
      return res.status(400).json({
        success: false,
        message: "Invalid Department Name",
        data: []
      });
    }

    const subjects = await Subjects.find(
      { DepartmentID: findDepartmentID._id },
      { _id: 0, SubjectCode: 1, SubjectName: 1 }
    ).lean();

    if (!subjects.length) {
      return res.status(200).json({
        success: true,
        message: `No Subjects found for department ${trimmedDepartmentName}`,
        data: []
      });
    }

    logger.info(`Fetched ${subjects.length} Subjects`);
    return res.status(200).json({
      success: true,
      message: `Fetched ${subjects.length} Subjects`,
      data: subjects
    });
  } catch (error) {
    logger.error(`Error fetching subjects: ${error.message}`, {
      stack: error.stack
    });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: []
    });
  }
};

module.exports = getAllSubjects;
