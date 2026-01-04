const Department = require("../../models/department");
const Subjects = require("../../models/subjects");
const logger = require("../../logger/logger");

const addSubjects = async (req, res) => {
  try {
    const subjects = req.body; // Expecting an array of subjects

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body must be a non-empty array of subjects",
      });
    }

    const results = [];

    for (const subj of subjects) {
      const { SubjectCode, SubjectName, DepartmentName } = subj;

      // Basic validation (extra safety in case middleware is bypassed)
      if (!SubjectCode || !SubjectName || !DepartmentName) {
        results.push({
          SubjectCode,
          SubjectName,
          success: false,
          message: "All fields are required",
        });
        continue;
      }

      // Check duplicate SubjectCode
      let existingSubject = await Subjects.findOne({ SubjectCode });
      if (existingSubject) {
        results.push({
          SubjectCode,
          SubjectName,
          success: false,
          message: `Subject code ${SubjectCode} already exists for ${existingSubject.SubjectName}`,
        });
        continue;
      }

      // Check duplicate SubjectName
      existingSubject = await Subjects.findOne({ SubjectName });
      if (existingSubject) {
        results.push({
          SubjectCode,
          SubjectName,
          success: false,
          message: `Subject name ${SubjectName} already exists with code ${existingSubject.SubjectCode}`,
        });
        continue;
      }

      // Find department
      const department = await Department.findOne({ DepartmentName });
      if (!department) {
        results.push({
          SubjectCode,
          SubjectName,
          success: false,
          message: `Invalid department name: ${DepartmentName}`,
        });
        continue;
      }

      // Create subject
      await Subjects.create({
        SubjectCode,
        SubjectName,
        DepartmentID: department._id,
      });

      logger.info(
        `Subject created successfully | ${SubjectName} | Code: ${SubjectCode} | Department: ${DepartmentName} | IP: ${req.ip}`
      );

      results.push({
        SubjectCode,
        SubjectName,
        success: true,
        message: "Subject added successfully",
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
