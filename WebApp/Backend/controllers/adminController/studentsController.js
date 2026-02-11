const students = require("../../models/students");
const logger = require("../../logger/logger");

/**
 * Get all students with pagination and optional filters
 */
const getAllStudents = async (req, res) => {
  try {
    const { page = 1, limit = 9, faculty, section, search } = req.query;

    logger.info(
      `Fetch all students | Page: ${page}, Limit: ${limit} | IP: ${req.ip}`
    );

    // Build filter object
    const filter = {};

    if (faculty) {
      filter.Faculty = faculty;
    }

    if (section) {
      filter.Section = section.toUpperCase();
    }

    if (search) {
      // Search by name, roll number, or email
      filter.$or = [
        { FullName: { $regex: search, $options: "i" } },
        { Email: { $regex: search, $options: "i" } },
        { RollNo: parseInt(search) || 0 },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch students with pagination
    const studentsList = await students
      .find(filter)
      .populate("Faculty", "DepartmentName DepartmentCode")
      .select(
        "RollNo FullName Email Phone Faculty Section Classroom YearOfEnrollment ProfileImagePath DateOfBirth UniversityReg"
      )
      .sort({ RollNo: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await students.countDocuments(filter);

    logger.info(
      `Fetched ${studentsList.length} students out of ${total} | IP: ${req.ip}`
    );

    return res.status(200).json({
      success: true,
      message: "Students fetched successfully",
      data: {
        students: studentsList,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error(
      `Failed to fetch students | Error: ${error.message} | IP: ${req.ip}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching students",
    });
  }
};

/**
 * Get student details by ID
 */
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    logger.info(`Fetch student by ID: ${id} | IP: ${req.ip}`);

    const student = await students
      .findById(id)
      .populate("Faculty", "DepartmentName DepartmentCode")
      .lean();

    if (!student) {
      logger.warn(`Student not found with ID: ${id} | IP: ${req.ip}`);
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    logger.info(`Student found: ${student.FullName} | IP: ${req.ip}`);

    return res.status(200).json({
      success: true,
      message: "Student details fetched successfully",
      data: student,
    });
  } catch (error) {
    logger.error(
      `Failed to fetch student | Error: ${error.message} | IP: ${req.ip}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching student details",
    });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
};
