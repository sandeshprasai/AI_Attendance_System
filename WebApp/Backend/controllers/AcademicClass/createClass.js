const AcademicClass = require("../../models/accademicClass");
const Classroom = require("../../models/classes");
const Department = require("../../models/department");
const Subject = require("../../models/subjects");
const Teacher = require("../../models/teachers");
const Student = require("../../models/students");
const logger = require("../../logger/logger");

const createAcademicClass = async (req, res) => {
  try {
    const {
      ClassName,
      ClassCode,
      PhysicalClassroom,
      Department: DepartmentId,
      Subject: SubjectId,
      Teacher: TeacherId,
      Students: StudentIds,
      Semester,
      AcademicYear,
      Section,
      MaxCapacity,
      Description,
    } = req.body;

    logger.info(`Create Academic Class request | Code: ${ClassCode} | IP: ${req.ip}`);

    // Check if ClassCode already exists
    const existingClass = await AcademicClass.findOne({ ClassCode });
    if (existingClass) {
      logger.warn(`Duplicate ClassCode | Code: ${ClassCode} | IP: ${req.ip}`);
      return res.status(409).json({
        success: false,
        message: `Academic class with code ${ClassCode} already exists`,
      });
    }

    // Validate Physical Classroom exists
    const classroom = await Classroom.findById(PhysicalClassroom);
    if (!classroom) {
      logger.warn(`Physical Classroom not found | ID: ${PhysicalClassroom} | IP: ${req.ip}`);
      return res.status(404).json({
        success: false,
        message: "Physical classroom not found",
      });
    }

    // Validate Department exists
    const department = await Department.findById(DepartmentId);
    if (!department) {
      logger.warn(`Department not found | ID: ${DepartmentId} | IP: ${req.ip}`);
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Validate Subject exists and belongs to the department
    const subject = await Subject.findOne({ _id: SubjectId, DepartmentID: DepartmentId });
    if (!subject) {
      logger.warn(`Subject not found or doesn't belong to department | Subject ID: ${SubjectId} | IP: ${req.ip}`);
      return res.status(404).json({
        success: false,
        message: "Subject not found or doesn't belong to the selected department",
      });
    }

    // Validate Teacher exists
    const teacher = await Teacher.findById(TeacherId);
    if (!teacher) {
      logger.warn(`Teacher not found | ID: ${TeacherId} | IP: ${req.ip}`);
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Validate Students exist and belong to the department
    if (StudentIds && StudentIds.length > 0) {
      const students = await Student.find({ _id: { $in: StudentIds }, Faculty: DepartmentId });
      
      if (students.length !== StudentIds.length) {
        logger.warn(`Some students not found or don't belong to department | IP: ${req.ip}`);
        return res.status(404).json({
          success: false,
          message: "Some students not found or don't belong to the selected department",
        });
      }

      // Check if students count exceeds capacity
      const capacity = MaxCapacity || 48;
      if (students.length > capacity) {
        logger.warn(`Students exceed capacity | Count: ${students.length} | Capacity: ${capacity} | IP: ${req.ip}`);
        return res.status(400).json({
          success: false,
          message: `Cannot assign ${students.length} students. Maximum capacity is ${capacity}`,
        });
      }

      // Check if physical classroom capacity is sufficient
      if (students.length > classroom.capacity) {
        logger.warn(`Students exceed physical classroom capacity | IP: ${req.ip}`);
        return res.status(400).json({
          success: false,
          message: `Cannot assign ${students.length} students. Physical classroom capacity is ${classroom.capacity}`,
        });
      }
    }

    // Create the academic class
    const academicClass = new AcademicClass({
      ClassName,
      ClassCode,
      PhysicalClassroom,
      Department: DepartmentId,
      Subject: SubjectId,
      Teacher: TeacherId,
      Students: StudentIds || [],
      Semester,
      AcademicYear,
      Section,
      MaxCapacity: MaxCapacity || 48,
      Description,
      Status: "active",
    });

    await academicClass.save();

    // Update teacher's Classroom field
    await Teacher.findByIdAndUpdate(
      TeacherId,
      { $addToSet: { Classroom: academicClass._id } },
      { new: true }
    );

    // Populate the created class
    await academicClass.populate([
      { path: "PhysicalClassroom", select: "Classroom capacity" },
      { path: "Department", select: "DepartmentName DepartmentCode" },
      { path: "Subject", select: "SubjectName SubjectCode" },
      { path: "Teacher", select: "FullName EmployeeId Email" },
      { path: "Students", select: "FullName RollNo Email" },
    ]);

    logger.info(`Academic Class created successfully | Code: ${ClassCode} | IP: ${req.ip}`);

    return res.status(201).json({
      success: true,
      message: "Academic class created successfully",
      data: academicClass,
    });

  } catch (error) {
    logger.error(`Create Academic Class failed | Error: ${error.message} | IP: ${req.ip}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating academic class",
    });
  }
};

module.exports = createAcademicClass;
