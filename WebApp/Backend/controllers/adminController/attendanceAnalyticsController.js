const Attendance = require('../../models/attendance');
const Student = require('../../models/students');
const logger = require('../../logger/logger');
const { getTodayKathmanduRange, getKathmanduStartOfDay, getKathmanduEndOfDay } = require('../../Utills/timezoneHelper');

// Get today's attendance analytics
const getTodayAttendanceAnalytics = async (req, res) => {
  try {
    // Get start and end of today in Kathmandu timezone
    const { startOfDay, endOfDay } = getTodayKathmanduRange();
    
    logger.info(`Fetching attendance for Kathmandu timezone: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);

    // Get all finalized attendance records for today
    const todayAttendance = await Attendance.find({
      Date: { $gte: startOfDay, $lte: endOfDay },
      Status: 'finalized'
    }).select('PresentCount AbsentCount TotalStudents FinalAttendanceRecords AcademicClass Subject Date')
      .populate('AcademicClass', 'ClassName Section')
      .populate('Subject', 'SubjectName SubjectCode')
      .populate({
        path: 'FinalAttendanceRecords.Student',
        select: 'FullName RollNo Email GuardianPhone'
      })
      .lean();

    // Get total unique students in the system
    const totalStudentsInSystem = await Student.countDocuments({ isActive: true });

    // Calculate aggregate stats
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalExpected = 0;
    const absentStudentsList = [];
    const classWiseStats = [];

    todayAttendance.forEach((record) => {
      totalPresent += record.PresentCount || 0;
      totalAbsent += record.AbsentCount || 0;
      totalExpected += record.TotalStudents || 0;

      // Collect absent students
      if (record.FinalAttendanceRecords) {
        record.FinalAttendanceRecords.forEach((studentRecord) => {
          if (studentRecord.FinalStatus === 'absent' && studentRecord.Student) {
            absentStudentsList.push({
              studentId: studentRecord.Student._id,
              name: studentRecord.Student.FullName,
              rollNumber: studentRecord.Student.RollNo,
              email: studentRecord.Student.Email,
              parentPhone: studentRecord.Student.GuardianPhone,
              className: record.AcademicClass ? `${record.AcademicClass.ClassName} ${record.AcademicClass.Section || ''}`.trim() : 'Unknown',
              subject: record.Subject?.SubjectName || 'Unknown',
              subjectCode: record.Subject?.SubjectCode,
              subjectId: record.Subject?._id,
              date: record.Date,
              attendanceId: record._id
            });
          }
        });
      }

      // Class-wise statistics
      if (record.AcademicClass) {
        classWiseStats.push({
          className: `${record.AcademicClass.ClassName} ${record.AcademicClass.Section || ''}`.trim(),
          present: record.PresentCount,
          absent: record.AbsentCount,
          total: record.TotalStudents,
          attendanceRate: record.TotalStudents > 0 
            ? ((record.PresentCount / record.TotalStudents) * 100).toFixed(1)
            : 0
        });
      }
    });

    // Calculate overall attendance rate
    const attendanceRate = totalExpected > 0 
      ? ((totalPresent / totalExpected) * 100).toFixed(1)
      : 0;

    // Remove duplicate absent students (same student might be absent in multiple classes)
    const uniqueAbsentStudents = Array.from(
      new Map(absentStudentsList.map(student => [student.studentId.toString(), student])).values()
    );

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalPresent,
          totalAbsent,
          totalExpected,
          attendanceRate: parseFloat(attendanceRate),
          totalStudentsInSystem,
          sessionsToday: todayAttendance.length
        },
        absentStudents: uniqueAbsentStudents,
        classWiseStats
      }
    });

  } catch (error) {
    logger.error('Error fetching today\'s attendance analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance analytics',
      error: error.message
    });
  }
};

// Get absent students list
const getAbsentStudentsList = async (req, res) => {
  try {
    const { date } = req.query;
    
    let queryDate = new Date();
    if (date) {
      queryDate = new Date(date);
    }

    // Use Kathmandu timezone for date range
    const startOfDay = getKathmanduStartOfDay(queryDate);
    const endOfDay = getKathmanduEndOfDay(queryDate);

    const attendanceRecords = await Attendance.find({
      Date: { $gte: startOfDay, $lte: endOfDay },
      Status: 'finalized'
    }).populate({
      path: 'FinalAttendanceRecords.Student',
      select: 'FullName RollNo Email Phone GuardianPhone'
    }).populate('AcademicClass', 'ClassName Section')
      .populate('Subject', 'SubjectName SubjectCode')
      .lean();

    const absentStudents = [];

    attendanceRecords.forEach((record) => {
      if (record.FinalAttendanceRecords) {
        record.FinalAttendanceRecords.forEach((studentRecord) => {
          if (studentRecord.FinalStatus === 'absent' && studentRecord.Student) {
            absentStudents.push({
              studentId: studentRecord.Student._id,
              name: studentRecord.Student.FullName,
              rollNumber: studentRecord.Student.RollNo,
              email: studentRecord.Student.Email,
              phoneNumber: studentRecord.Student.Phone,
              parentPhone: studentRecord.Student.GuardianPhone,
              className: record.AcademicClass ? `${record.AcademicClass.ClassName} ${record.AcademicClass.Section || ''}`.trim() : 'Unknown',
              subject: record.Subject?.SubjectName || 'Unknown',
              date: record.Date,
              sessionId: record.SessionId
            });
          }
        });
      }
    });

    // Remove duplicates
    const uniqueAbsentStudents = Array.from(
      new Map(absentStudents.map(student => [student.studentId.toString(), student])).values()
    );

    res.status(200).json({
      success: true,
      data: uniqueAbsentStudents,
      count: uniqueAbsentStudents.length
    });

  } catch (error) {
    logger.error('Error fetching absent students list:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch absent students',
      error: error.message
    });
  }
};

// Get today's attendance analytics for a specific teacher
const getTeacherTodayAttendanceAnalytics = async (req, res) => {
  try {
    // Get teacher ID from authenticated user
    const teacherId = req.user.id;
    
    // Get start and end of today in Kathmandu timezone
    const { startOfDay, endOfDay } = getTodayKathmanduRange();
    
    logger.info(`Fetching teacher attendance for user ID: ${teacherId}`);

    // First, find the teacher document by matching user
    const Teacher = require('../../models/teachers');
    const User = require('../../models/users');
    
    // Get user details to find teacher by name (since Teacher._id != User._id)
    const user = await User.findById(teacherId).select('name');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find teacher by matching name
    const teacher = await Teacher.findOne({ FullName: user.name });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    // Get all finalized attendance records for today for this teacher's classes
    const todayAttendance = await Attendance.find({
      Date: { $gte: startOfDay, $lte: endOfDay },
      Status: 'finalized',
      Teacher: teacher._id
    }).select('PresentCount AbsentCount TotalStudents FinalAttendanceRecords AcademicClass Subject Date')
      .populate('AcademicClass', 'ClassName Section')
      .populate('Subject', 'SubjectName SubjectCode')
      .populate({
        path: 'FinalAttendanceRecords.Student',
        select: 'FullName RollNo Email'
      })
      .lean();

    // Calculate aggregate stats
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalExpected = 0;
    const classWiseStats = [];

    todayAttendance.forEach((record) => {
      totalPresent += record.PresentCount || 0;
      totalAbsent += record.AbsentCount || 0;
      totalExpected += record.TotalStudents || 0;

      // Class-wise statistics
      if (record.AcademicClass) {
        classWiseStats.push({
          className: `${record.AcademicClass.ClassName} ${record.AcademicClass.Section || ''}`.trim(),
          subject: record.Subject?.SubjectName || 'Unknown',
          present: record.PresentCount,
          absent: record.AbsentCount,
          total: record.TotalStudents,
          attendanceRate: record.TotalStudents > 0 
            ? ((record.PresentCount / record.TotalStudents) * 100).toFixed(1)
            : 0
        });
      }
    });

    // Calculate overall attendance rate
    const attendanceRate = totalExpected > 0 
      ? ((totalPresent / totalExpected) * 100).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalPresent,
          totalAbsent,
          totalExpected,
          attendanceRate: parseFloat(attendanceRate),
          sessionsToday: todayAttendance.length
        },
        classWiseStats
      }
    });

  } catch (error) {
    logger.error('Error fetching teacher\'s attendance analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance analytics',
      error: error.message
    });
  }
};

// Get teacher's class breakdown with pagination, search, and filters
const getTeacherClassBreakdown = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { page = 1, limit = 10, search = '', filter = 'all', sortBy = 'attendanceRate' } = req.query;
    
    const { startOfDay, endOfDay } = getTodayKathmanduRange();
    
    logger.info(`Fetching teacher class breakdown for user ID: ${teacherId}`);

    // Get teacher document
    const Teacher = require('../../models/teachers');
    const User = require('../../models/users');
    
    const user = await User.findById(teacherId).select('name');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const teacher = await Teacher.findOne({ FullName: user.name });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    // Get all finalized attendance records for today for this teacher
    const todayAttendance = await Attendance.find({
      Date: { $gte: startOfDay, $lte: endOfDay },
      Status: 'finalized',
      Teacher: teacher._id
    }).select('PresentCount AbsentCount TotalStudents AcademicClass Subject Date')
      .populate('AcademicClass', 'ClassName Section Semester')
      .populate('Subject', 'SubjectName SubjectCode')
      .lean();

    // Build class-wise statistics
    const classStatsMap = new Map();
    
    todayAttendance.forEach((record) => {
      if (record.AcademicClass) {
        const classId = record.AcademicClass._id.toString();
        const className = `${record.AcademicClass.ClassName} ${record.AcademicClass.Section || ''}`.trim();
        
        if (!classStatsMap.has(classId)) {
          classStatsMap.set(classId, {
            className,
            subjectName: record.Subject?.SubjectName || 'Unknown',
            semester: record.AcademicClass.Semester,
            present: 0,
            absent: 0,
            total: 0,
            sessionsToday: 0,
            attendanceRate: 0
          });
        }
        
        const stats = classStatsMap.get(classId);
        stats.present += record.PresentCount || 0;
        stats.absent += record.AbsentCount || 0;
        stats.total += record.TotalStudents || 0;
        stats.sessionsToday += 1;
        stats.attendanceRate = stats.total > 0 
          ? ((stats.present / stats.total) * 100).toFixed(1)
          : 0;
      }
    });

    // Convert map to array
    let classStats = Array.from(classStatsMap.values());

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      classStats = classStats.filter(cls => 
        cls.className.toLowerCase().includes(searchLower) ||
        cls.subjectName.toLowerCase().includes(searchLower)
      );
    }

    // Apply attendance rate filter
    if (filter !== 'all') {
      classStats = classStats.filter(cls => {
        const rate = parseFloat(cls.attendanceRate);
        if (filter === 'high') return rate >= 75;
        if (filter === 'medium') return rate >= 50 && rate < 75;
        if (filter === 'low') return rate < 50;
        return true;
      });
    }

    // Apply sorting
    classStats.sort((a, b) => {
      switch (sortBy) {
        case 'className':
          return a.className.localeCompare(b.className);
        case 'present':
          return b.present - a.present;
        case 'absent':
          return b.absent - a.absent;
        case 'attendanceRate':
        default:
          return parseFloat(b.attendanceRate) - parseFloat(a.attendanceRate);
      }
    });

    // Apply pagination
    const totalClasses = classStats.length;
    const totalPages = Math.ceil(totalClasses / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedClasses = classStats.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: {
        classes: paginatedClasses,
        currentPage: parseInt(page),
        totalPages,
        totalClasses,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    logger.error('Error fetching teacher class breakdown:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class breakdown',
      error: error.message
    });
  }
};

module.exports = {
  getTodayAttendanceAnalytics,
  getAbsentStudentsList,
  getTeacherTodayAttendanceAnalytics,
  getTeacherClassBreakdown
};
