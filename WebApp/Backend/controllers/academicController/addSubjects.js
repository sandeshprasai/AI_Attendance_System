const Department = require("../../models/department");
const Subjects = require("../../models/subjects");
const logger = require("../../logger/logger");

const addSubjects = async (req, res) => {
  try {
    const subjects = req.body;

    if (!Array.isArray(subjects) || subjects.length === 0) {
      logger.warn(
        `Empty subjects fields | IP: ${req.ip}`
      );
      return res.status(400).json({
        success: false,
        message: "Request body must be a non-empty array of subjects",
      });
    }

    const results = [];

    for (const subj of subjects) {
      const { SubjectCode, SubjectName, DepartmentName } = subj;

      // Empty fields
      if (!SubjectCode || !SubjectName || !DepartmentName) {
        logger.warn(
          `Empty subjects fields | Code: ${SubjectCode || "N/A"} | IP: ${req.ip}`
        );
        results.push({
          SubjectCode,
          SubjectName,
          success: false,
          message: "All fields are required",
        });
        continue;
      }

      // Duplicate Subject Code
      let existingSubject = await Subjects.findOne({ SubjectCode });
      if (existingSubject) {
        logger.warn(
          `Duplicate Subject Code | Code: ${SubjectCode} | Existing Subject: ${existingSubject.SubjectName} | IP: ${req.ip}`
        );
        results.push({
          SubjectCode,
          SubjectName,
          success: false,
          message: "Duplicate Subject Code",
        });
        continue;
      }

      // Duplicate Subject Name
      existingSubject = await Subjects.findOne({ SubjectName });
      if (existingSubject) {
        logger.warn(
          `Subject already exists | Name: ${SubjectName} | Code: ${existingSubject.SubjectCode} | IP: ${req.ip}`
        );
        results.push({
          SubjectCode,
          SubjectName,
          success: false,
          message: "Subject already exists",
        });
        continue;
      }

      // Invalid Department
      const department = await Department.findOne({ DepartmentName });
      if (!department) {
        logger.warn(
          `Invalid Department Name to add Subjects | Department: ${DepartmentName} | IP: ${req.ip}`
        );
        results.push({
          SubjectCode,
          SubjectName,
          success: false,
          message: "Invalid Department Name",
        });
        continue;
      }

      // Create Subject
      await Subjects.create({
        SubjectCode,
        SubjectName,
        DepartmentID: department._id,
      });

      logger.info(
        `Subject Created Successfully | Code: ${SubjectCode} | Name: ${SubjectName} | Department: ${DepartmentName} | IP: ${req.ip}`
      );

      results.push({
        SubjectCode,
        SubjectName,
        success: true,
        message: "Subject Created Successfully",
      });
    }

    return res.status(207).json({
      success: true,
      results,
    });
  } catch (error) {
    logger.error(
      `Add Subjects failed | Error: ${error.message} | IP: ${req.ip}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error while adding subjects",
    });
  }
};

module.exports = addSubjects;
