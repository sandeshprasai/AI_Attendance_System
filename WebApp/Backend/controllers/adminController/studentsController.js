const students = require("../../models/students");
const studentEmbedding = require("../../models/studentEmbedding");
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

/**
 * Get recently added students (last 30 days)
 */
const getRecentlyAddedStudents = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    logger.info(
      `Fetch recently added students | Page: ${page}, Limit: ${limit} | IP: ${req.ip}`
    );

    // Get date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch recently added students
    const recentStudents = await students
      .find({ createdAt: { $gte: thirtyDaysAgo } })
      .populate("Faculty", "DepartmentName DepartmentCode")
      .select(
        "RollNo FullName Email Phone Faculty Section Classroom YearOfEnrollment ProfileImagePath createdAt"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await students.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    logger.info(
      `Fetched ${recentStudents.length} recent students out of ${total} | IP: ${req.ip}`
    );

    return res.status(200).json({
      success: true,
      message: "Recently added students fetched successfully",
      data: {
        students: recentStudents,
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
      `Failed to fetch recent students | Error: ${error.message} | IP: ${req.ip}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching recent students",
    });
  }
};

/**
 * Get students without face embeddings (pending verification)
 */
const getStudentsWithoutEmbeddings = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    logger.info(
      `Fetch students without embeddings | Page: ${page}, Limit: ${limit} | IP: ${req.ip}`
    );

    // Get all student IDs that have embeddings
    const enrolledStudentIds = await studentEmbedding
      .distinct("StudentId")
      .lean();

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find students NOT in the enrolled list
    const pendingStudents = await students
      .find({ _id: { $nin: enrolledStudentIds } })
      .populate("Faculty", "DepartmentName DepartmentCode")
      .select(
        "RollNo FullName Email Phone Faculty Section Classroom YearOfEnrollment ProfileImagePath createdAt"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await students.countDocuments({
      _id: { $nin: enrolledStudentIds },
    });

    logger.info(
      `Fetched ${pendingStudents.length} students without embeddings out of ${total} | IP: ${req.ip}`
    );

    return res.status(200).json({
      success: true,
      message: "Students without face embeddings fetched successfully",
      data: {
        students: pendingStudents,
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
      `Failed to fetch students without embeddings | Error: ${error.message} | IP: ${req.ip}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching students",
    });
  }
};

/**
 * Get student management stats
 */
const getStudentManagementStats = async (req, res) => {
  try {
    logger.info(`Fetch student management stats | IP: ${req.ip}`);

    // Get date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get total students
    const totalStudents = await students.countDocuments();

    // Get recently added students count
    const recentlyAdded = await students.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Get enrolled student IDs
    const enrolledStudentIds = await studentEmbedding
      .distinct("StudentId")
      .lean();

    // Get pending verification count
    const pendingVerification = await students.countDocuments({
      _id: { $nin: enrolledStudentIds },
    });

    logger.info(`Student management stats fetched | IP: ${req.ip}`);

    return res.status(200).json({
      success: true,
      message: "Student management stats fetched successfully",
      data: {
        totalStudents,
        recentlyAdded,
        pendingVerification,
      },
    });
  } catch (error) {
    logger.error(
      `Failed to fetch student management stats | Error: ${error.message} | IP: ${req.ip}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching stats",
    });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  getRecentlyAddedStudents,
  getStudentsWithoutEmbeddings,
  getStudentManagementStats,
};
