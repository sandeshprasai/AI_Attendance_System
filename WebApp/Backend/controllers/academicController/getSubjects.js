const { log } = require("winston");
const logger = require("../../logger/logger");
const Subjects = require("../../models/subjects");
const Department = require("../../models/department");

const getAllSubjects = async (req, res) => {
  logger.info(` Received Request to fetch Departments from IP : ${req.ip} `);
  const DepartmentName = req.query.DepartmentName.trim();
  console.log(DepartmentName);
  try {
    const findDepartmentID = await Department.findOne(
      { DepartmentName: DepartmentName },
      { _id: 1 }
    );
    console.log(findDepartmentID);
    if (!findDepartmentID) {
      logger.warn(`Invalid Department: ${DepartmentName}`);
      return res
        .status(400)
        .json({ success: false, message: "Invalid Department Name", data: [] });
    }

    const subjects = await Subjects.find(
      {  DepartmentID: findDepartmentID._id  },
      { _id: 0, SubjectCode: 1, SubjectName: 1 }
    ).lean();
    if (!subjects || subjects.length === 0) {
      logger.warn(`No subjects found in database.`);
      return res.status(200).json({
        success: true,
        message: `No Subjects  found for fepartment ${DepartmentName}`,
        data: [],
      });
    }

    logger.info(`Fetched ${subjects.length} Subjects`);
    return res.status(200).json({
      success: true,
      message: ` Fetched ${subjects.length} Subjects`,
      data: subjects,
    });
  } catch (error) {
    logger.error(
      `An error occured while fetching the subjects ${error.message}`,
      { stack: error.stack }
    );
    return res
      .status(500)
      .json({ success: false, message: `Internal Server error`, data: [] });
  }
};

module.exports = getAllSubjects;
