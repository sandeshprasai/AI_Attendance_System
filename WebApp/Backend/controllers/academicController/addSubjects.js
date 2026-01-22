const Department = require("../../models/department");
const Subjects = require("../../models/subjects");
const logger = require("../../logger/logger");

const addSubjects = async (req, res) => {
  try {
    // Joi already validated this
    const subjects = req.body;

    const departmentNames = subjects.map((s) => s.DepartmentName.trim());

    const departments = await Department.find(
      { DepartmentName: { $in: departmentNames } },
      { _id: 1, DepartmentName: 1 },
    ).lean();

    const departmentMap = {};
    departments.forEach((d) => {
      departmentMap[d.DepartmentName] = d._id;
    });

    const docsToInsert = [];
    const results = [];

    /* ----------------------------------
       1. Validate departments
    -----------------------------------*/
    subjects.forEach((subj) => {
      const { SubjectCode, SubjectName, DepartmentName, Semester } = subj;

      const departmentId = departmentMap[DepartmentName.trim()];

      if (!departmentId) {
        logger.warn(`Invalid Department | ${DepartmentName} | IP: ${req.ip}`);
        results.push({
          SubjectCode,
          SubjectName,
          success: false,
          message: "Invalid Department Name",
        });
        return;
      }

      docsToInsert.push({
        SubjectCode,
        SubjectName,
        DepartmentID: departmentId,
        Semester,
      });
    });

    /* ----------------------------------
       2. Insert valid subjects only
    -----------------------------------*/
    let insertedDocs = [];

    if (docsToInsert.length > 0) {
      try {
        insertedDocs = await Subjects.insertMany(docsToInsert, {
          ordered: false,
        });
      } catch (err) {
        // Handle duplicate key errors only
        if (err.code !== 11000 && !err.writeErrors) {
          throw err;
        }
        insertedDocs = err.insertedDocs || [];
      }
    }

    const insertedCodes = new Set(insertedDocs.map((d) => d.SubjectCode));

    /* ----------------------------------
       3. Build final response
    -----------------------------------*/
    docsToInsert.forEach((doc) => {
      if (insertedCodes.has(doc.SubjectCode)) {
        logger.info(
          `Subject Created | Code: ${doc.SubjectCode} | IP: ${req.ip}`,
        );
        results.push({
          SubjectCode: doc.SubjectCode,
          SubjectName: doc.SubjectName,
          success: true,
          message: "Subject Created Successfully",
        });
      } else {
        logger.warn(
          `Duplicate Subject | Code: ${doc.SubjectCode} | IP: ${req.ip}`,
        );
        results.push({
          SubjectCode: doc.SubjectCode,
          SubjectName: doc.SubjectName,
          success: false,
          message: "Duplicate Subject Code or Name",
        });
      }
    });

    /* ----------------------------------
       4. Overall success flag
    -----------------------------------*/
    const overallSuccess = results.some((r) => r.success === true);

    return res.status(200).json({
      success: overallSuccess,
      results,
    });
  } catch (error) {
    logger.error(`Add Subjects Failed | ${error.message} | IP: ${req.ip}`, {
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Internal server error while adding subjects",
    });
  }
};

module.exports = addSubjects;
