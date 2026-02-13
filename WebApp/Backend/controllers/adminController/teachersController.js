const teachers = require("../../models/teachers");
const AcademicClass = require("../../models/accademicClass");
const logger = require("../../logger/logger");

/**
 * Get all teachers with pagination and optional filters
 */
const getAllTeachers = async (req, res) => {
  try {
    const { page = 1, limit = 9, faculty, search } = req.query;

    logger.info(
      `Fetch all teachers | Page: ${page}, Limit: ${limit} | IP: ${req.ip}`
    );

    // Build filter object
    const filter = {};

    if (faculty) {
      filter.Faculty = faculty;
    }

    if (search) {
      // Search by name, employee ID, or email
      filter.$or = [
        { FullName: { $regex: search, $options: "i" } },
        { Email: { $regex: search, $options: "i" } },
        { EmployeeId: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch teachers with pagination
    const teachersList = await teachers
      .find(filter)
      .populate("Subjects", "SubjectName SubjectCode")
      .select(
        "EmployeeId FullName Email Phone Faculty Subjects JoinedYear ProfileImagePath DateOfBirth FullAddress"
      )
      .sort({ EmployeeId: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await teachers.countDocuments(filter);

    logger.info(
      `Fetched ${teachersList.length} teachers out of ${total} | IP: ${req.ip}`
    );

    return res.status(200).json({
      success: true,
      message: "Teachers fetched successfully",
      data: {
        teachers: teachersList,
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
      `Failed to fetch teachers | Error: ${error.message} | IP: ${req.ip}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching teachers",
    });
  }
};

/**
 * Get teacher details by ID
 */
const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;

    logger.info(`Fetch teacher by ID: ${id} | IP: ${req.ip}`);

    const teacher = await teachers
      .findById(id)
      .populate("Subjects", "SubjectName SubjectCode")
      .populate("Classroom", "Classroom capacity description")
      .lean();

    if (!teacher) {
      logger.warn(`Teacher not found with ID: ${id} | IP: ${req.ip}`);
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    logger.info(`Teacher found: ${teacher.FullName} | IP: ${req.ip}`);

    return res.status(200).json({
      success: true,
      message: "Teacher details fetched successfully",
      data: teacher,
    });
  } catch (error) {
    logger.error(
      `Failed to fetch teacher | Error: ${error.message} | IP: ${req.ip}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching teacher details",
    });
  }
};

/**
 * Get recently added teachers (last 30 days)
 */
const getRecentlyAddedTeachers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    logger.info(
      `Fetch recently added teachers | Page: ${page}, Limit: ${limit} | IP: ${req.ip}`
    );

    // Get date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch recently added teachers
    const recentTeachers = await teachers
      .find({ createdAt: { $gte: thirtyDaysAgo } })
      .populate("Subjects", "SubjectName SubjectCode")
      .select(
        "EmployeeId FullName Email Phone Faculty Subjects JoinedYear ProfileImagePath createdAt"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await teachers.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    logger.info(
      `Fetched ${recentTeachers.length} recent teachers out of ${total} | IP: ${req.ip}`
    );

    return res.status(200).json({
      success: true,
      message: "Recently added teachers fetched successfully",
      data: {
        teachers: recentTeachers,
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
      `Failed to fetch recent teachers | Error: ${error.message} | IP: ${req.ip}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching recent teachers",
    });
  }
};

/**
 * Get active teachers with their active classes
 */
const getActiveTeachers = async (req, res) => {
  try {
    logger.info(`Fetch active teachers | IP: ${req.ip}`);

    // Get all active academic classes with teacher populated
    const activeClasses = await AcademicClass
      .find({ Status: "active" })
      .populate("Teacher", "EmployeeId FullName Email Phone Faculty ProfileImagePath")
      .select("ClassName Teacher Semester AcademicYear Students")
      .lean();

    // Group by teacher
    const teacherMap = new Map();

    activeClasses.forEach(cls => {
      if (cls.Teacher) {
        const teacherId = cls.Teacher._id.toString();
        if (!teacherMap.has(teacherId)) {
          teacherMap.set(teacherId, {
            teacher: cls.Teacher,
            classes: [],
          });
        }
        teacherMap.get(teacherId).classes.push({
          _id: cls._id,
          ClassName: cls.ClassName,
          Semester: cls.Semester,
          AcademicYear: cls.AcademicYear,
          studentsCount: cls.Students?.length || 0,
        });
      }
    });

    // Convert to array
    const activeTeachers = Array.from(teacherMap.values());

    logger.info(
      `Found ${activeTeachers.length} active teachers | IP: ${req.ip}`
    );

    return res.status(200).json({
      success: true,
      message: "Active teachers fetched successfully",
      data: {
        activeTeachers,
        totalActive: activeTeachers.length,
      },
    });
  } catch (error) {
    logger.error(
      `Failed to fetch active teachers | Error: ${error.message} | IP: ${req.ip}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching active teachers",
    });
  }
};

/**
 * Get teacher management stats
 */
const getTeacherManagementStats = async (req, res) => {
  try {
    logger.info(`Fetch teacher management stats | IP: ${req.ip}`);

    // Get date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get total teachers
    const totalTeachers = await teachers.countDocuments();

    // Get recently added teachers count
    const recentlyAdded = await teachers.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Get active teachers (those teaching active classes)
    const activeClasses = await AcademicClass
      .find({ Status: "active" })
      .distinct("Teacher")
      .lean();
    
    const activeTeachers = activeClasses.filter(t => t != null).length;

    logger.info(`Teacher management stats fetched | IP: ${req.ip}`);

    return res.status(200).json({
      success: true,
      message: "Teacher management stats fetched successfully",
      data: {
        totalTeachers,
        recentlyAdded,
        activeTeachers,
      },
    });
  } catch (error) {
    logger.error(
      `Failed to fetch teacher management stats | Error: ${error.message} | IP: ${req.ip}`
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching stats",
    });
  }
};

module.exports = {
  getAllTeachers,
  getTeacherById,
  getRecentlyAddedTeachers,
  getActiveTeachers,
  getTeacherManagementStats,
};
