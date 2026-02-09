const AcademicClass = require("../../models/accademicClass");
const Classroom = require("../../models/classes");
const Department = require("../../models/department");
const Subject = require("../../models/subjects");
const Teacher = require("../../models/teachers");
const Student = require("../../models/students");
const logger = require("../../logger/logger");

// ==================== GET ALL ACADEMIC CLASSES ====================
const getAllAcademicClasses = async (req, res) => {
  try {
    const { status, departmentId, semester, academicYear } = req.query;

    logger.info(`Fetch academic classes | IP: ${req.ip}`);

    const filter = {};
    
    if (status) {
      filter.Status = status;
    }
    
    if (departmentId) {
      filter.Department = departmentId;
    }
    
    if (semester) {
      filter.Semester = parseInt(semester);
    }
    
    if (academicYear) {
      filter.AcademicYear = academicYear;
    }

    const academicClasses = await AcademicClass.find(filter)
      .populate("PhysicalClassroom", "Classroom capacity")
      .populate("Department", "DepartmentName DepartmentCode")
      .populate("Subject", "SubjectName SubjectCode Semester")
      .populate("Teacher", "FullName EmployeeId Email")
      .populate("Students", "FullName RollNo Email")
      .sort({ createdAt: -1 });

    logger.info(`Fetched ${academicClasses.length} academic classes | IP: ${req.ip}`);

    return res.status(200).json({
      success: true,
      message: "Academic classes fetched successfully",
      data: academicClasses,
    });

  } catch (error) {
    logger.error(`Fetch academic classes failed | Error: ${error.message} | IP: ${req.ip}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching academic classes",
    });
  }
};

// ==================== GET ACADEMIC CLASS BY ID ====================
const getAcademicClassById = async (req, res) => {
  try {
    const { id } = req.params;

    logger.info(`Fetch academic class by ID | ID: ${id} | IP: ${req.ip}`);

    const academicClass = await AcademicClass.findById(id)
      .populate("PhysicalClassroom", "Classroom capacity description")
      .populate("Department", "DepartmentName DepartmentCode")
      .populate("Subject", "SubjectName SubjectCode Semester")
      .populate("Teacher", "FullName EmployeeId Email Phone")
      .populate("Students", "FullName RollNo Email Phone Classroom Section");

    if (!academicClass) {
      logger.warn(`Academic class not found | ID: ${id} | IP: ${req.ip}`);
      return res.status(404).json({
        success: false,
        message: "Academic class not found",
      });
    }

    logger.info(`Academic class fetched successfully | ID: ${id} | IP: ${req.ip}`);

    return res.status(200).json({
      success: true,
      message: "Academic class fetched successfully",
      data: academicClass,
    });

  } catch (error) {
    logger.error(`Fetch academic class failed | Error: ${error.message} | IP: ${req.ip}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching academic class",
    });
  }
};

// ==================== UPDATE ACADEMIC CLASS STATUS ====================
const updateAcademicClassStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    logger.info(`Update academic class status | ID: ${id} | Status: ${status} | IP: ${req.ip}`);

    if (!["active", "completed", "archived"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values: active, completed, archived",
      });
    }

    const academicClass = await AcademicClass.findById(id);

    if (!academicClass) {
      logger.warn(`Academic class not found | ID: ${id} | IP: ${req.ip}`);
      return res.status(404).json({
        success: false,
        message: "Academic class not found",
      });
    }

    academicClass.Status = status;
    await academicClass.save();

    logger.info(`Academic class status updated | ID: ${id} | New Status: ${status} | IP: ${req.ip}`);

    return res.status(200).json({
      success: true,
      message: "Academic class status updated successfully",
      data: academicClass,
    });

  } catch (error) {
    logger.error(`Update status failed | Error: ${error.message} | IP: ${req.ip}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating status",
    });
  }
};

// ==================== GET AVAILABLE CLASSROOMS ====================
const getAvailableClassrooms = async (req, res) => {
  try {
    const { minCapacity } = req.query;

    logger.info(`Fetch available classrooms | IP: ${req.ip}`);

    const filter = {};
    if (minCapacity) {
      filter.capacity = { $gte: parseInt(minCapacity) };
    }

    const classrooms = await Classroom.find(filter)
      .select("Classroom capacity description")
      .sort({ Classroom: 1 });

    logger.info(`Fetched ${classrooms.length} classrooms | IP: ${req.ip}`);

    return res.status(200).json({
      success: true,
      message: "Classrooms fetched successfully",
      data: classrooms,
    });

  } catch (error) {
    logger.error(`Fetch classrooms failed | Error: ${error.message} | IP: ${req.ip}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching classrooms",
    });
  }
};

// ==================== GET SUBJECTS BY DEPARTMENT ====================
const getSubjectsByDepartment = async (req, res) => {
  try {
    const { departmentId, semester } = req.query;

    logger.info(`Fetch subjects | Department: ${departmentId} | IP: ${req.ip}`);

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: "Department ID is required",
      });
    }

    const filter = { DepartmentID: departmentId };
    if (semester) {
      filter.Semester = parseInt(semester);
    }

    const subjects = await Subject.find(filter)
      .populate("DepartmentID", "DepartmentName DepartmentCode")
      .select("SubjectName SubjectCode Semester")
      .sort({ Semester: 1, SubjectName: 1 });

    logger.info(`Fetched ${subjects.length} subjects | IP: ${req.ip}`);

    return res.status(200).json({
      success: true,
      message: "Subjects fetched successfully",
      data: subjects,
    });

  } catch (error) {
    logger.error(`Fetch subjects failed | Error: ${error.message} | IP: ${req.ip}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching subjects",
    });
  }
};

// ==================== GET TEACHERS BY DEPARTMENT ====================
const getTeachersByDepartment = async (req, res) => {
  try {
    const { departmentId, subjectId } = req.query;

    logger.info(`Fetch teachers | Department: ${departmentId} | Subject: ${subjectId} | IP: ${req.ip}`);

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: "Department ID is required",
      });
    }

    // Get department name from ID since Teacher.Faculty is a string
    const department = await Department.findById(departmentId);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const filter = { Faculty: department.DepartmentName };
    
    // If subjectId is provided, filter teachers who teach that subject
    if (subjectId) {
      filter.Subjects = { $in: [subjectId] };
    }

    const teachers = await Teacher.find(filter)
      .select("FullName EmployeeId Email Phone Faculty Subjects")
      .populate("Subjects", "SubjectName SubjectCode")
      .sort({ FullName: 1 });

    logger.info(`Fetched ${teachers.length} teachers | IP: ${req.ip}`);

    return res.status(200).json({
      success: true,
      message: "Teachers fetched successfully",
      data: teachers,
    });

  } catch (error) {
    logger.error(`Fetch teachers failed | Error: ${error.message} | IP: ${req.ip}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching teachers",
    });
  }
};

// ==================== GET STUDENTS BY DEPARTMENT ====================
const getStudentsByDepartment = async (req, res) => {
  try {
    const { departmentId, semester, section, yearOfEnrollment } = req.query;

    logger.info(`Fetch students | Department: ${departmentId} | IP: ${req.ip}`);

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: "Department ID is required",
      });
    }

    const filter = { Faculty: departmentId };
    
    if (section) {
      filter.Section = section.toUpperCase();
    }
    
    if (yearOfEnrollment) {
      filter.YearOfEnrollment = parseInt(yearOfEnrollment);
    }

    const students = await Student.find(filter)
      .populate("Faculty", "DepartmentName DepartmentCode")
      .select("FullName RollNo Email Phone Classroom Section YearOfEnrollment")
      .sort({ RollNo: 1 });

    logger.info(`Fetched ${students.length} students | IP: ${req.ip}`);

    return res.status(200).json({
      success: true,
      message: "Students fetched successfully",
      data: students,
    });

  } catch (error) {
    logger.error(`Fetch students failed | Error: ${error.message} | IP: ${req.ip}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching students",
    });
  }
};

module.exports = {
  getAllAcademicClasses,
  getAcademicClassById,
  updateAcademicClassStatus,
  getAvailableClassrooms,
  getSubjectsByDepartment,
  getTeachersByDepartment,
  getStudentsByDepartment,
};
