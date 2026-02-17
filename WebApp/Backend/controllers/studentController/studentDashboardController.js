const Student = require('../../models/students');
const User = require('../../models/users');
const AcademicClass = require('../../models/accademicClass');
const Attendance = require('../../models/attendance');
const logger = require('../../logger/logger');
const { getTodayKathmanduRange } = require('../../Utills/timezoneHelper');

// Get student's overall attendance statistics
const getStudentOverallStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find user and get student profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find student by matching email or name
    const student = await Student.findOne({ 
      $or: [
        { Email: user.email },
        { FullName: user.name }
      ]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Get all finalized attendance sessions where student is enrolled
    const attendanceSessions = await Attendance.find({
      Status: 'finalized',
      'FinalAttendanceRecords.Student': student._id
    }).select('FinalAttendanceRecords');

    // Calculate statistics
    let totalSessions = attendanceSessions.length;
    let presentCount = 0;
    let absentCount = 0;

    attendanceSessions.forEach(session => {
      const studentRecord = session.FinalAttendanceRecords.find(
        r => r.Student.toString() === student._id.toString()
      );
      
      if (studentRecord) {
        if (studentRecord.FinalStatus === 'present') {
          presentCount++;
        } else {
          absentCount++;
        }
      }
    });

    const attendancePercentage = totalSessions > 0 
      ? ((presentCount / totalSessions) * 100).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalSessions,
        presentCount,
        absentCount,
        attendancePercentage: parseFloat(attendancePercentage)
      }
    });

  } catch (error) {
    logger.error('Error fetching student overall stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overall statistics',
      error: error.message
    });
  }
};

// Get student's recent absences
const getStudentRecentAbsences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 5 } = req.query;
    
    // Find user and get student profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const student = await Student.findOne({ 
      $or: [
        { Email: user.email },
        { FullName: user.name }
      ]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Get recent absence sessions
    const absentSessions = await Attendance.find({
      Status: 'finalized',
      'FinalAttendanceRecords.Student': student._id,
      'FinalAttendanceRecords.FinalStatus': 'absent'
    })
    .populate('Subject', 'SubjectName SubjectCode')
    .populate('AcademicClass', 'ClassName Section')
    .populate('Teacher', 'FullName')
    .sort({ Date: -1 })
    .limit(parseInt(limit))
    .lean();

    // Format absences
    const absences = absentSessions.map(session => ({
      sessionId: session.SessionId,
      date: session.Date,
      subject: session.Subject?.SubjectName || 'Unknown',
      subjectCode: session.Subject?.SubjectCode,
      className: session.AcademicClass ? 
        `${session.AcademicClass.ClassName} ${session.AcademicClass.Section || ''}`.trim() : 
        'Unknown',
      teacher: session.Teacher?.FullName || 'Unknown',
      sessionType: session.SessionType
    }));

    res.status(200).json({
      success: true,
      data: absences,
      count: absences.length
    });

  } catch (error) {
    logger.error('Error fetching student recent absences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent absences',
      error: error.message
    });
  }
};

// Get student's class-wise attendance
const getStudentClassWiseAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find user and get student profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const student = await Student.findOne({ 
      $or: [
        { Email: user.email },
        { FullName: user.name }
      ]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Get all finalized attendance sessions
    const attendanceSessions = await Attendance.find({
      Status: 'finalized',
      'FinalAttendanceRecords.Student': student._id
    })
    .populate('Subject', 'SubjectName SubjectCode')
    .populate('AcademicClass', 'ClassName Section')
    .populate('Teacher', 'FullName')
    .lean();

    // Group by subject and calculate stats
    const subjectStats = {};

    attendanceSessions.forEach(session => {
      const studentRecord = session.FinalAttendanceRecords.find(
        r => r.Student.toString() === student._id.toString()
      );

      if (studentRecord && session.Subject) {
        const subjectId = session.Subject._id.toString();
        
        if (!subjectStats[subjectId]) {
          subjectStats[subjectId] = {
            subjectId: session.Subject._id,
            subjectName: session.Subject.SubjectName,
            subjectCode: session.Subject.SubjectCode,
            className: session.AcademicClass ? 
              `${session.AcademicClass.ClassName} ${session.AcademicClass.Section || ''}`.trim() : 
              'Unknown',
            teacher: session.Teacher?.FullName || 'Unknown',
            totalSessions: 0,
            presentCount: 0,
            absentCount: 0
          };
        }

        subjectStats[subjectId].totalSessions++;
        if (studentRecord.FinalStatus === 'present') {
          subjectStats[subjectId].presentCount++;
        } else {
          subjectStats[subjectId].absentCount++;
        }
      }
    });

    // Convert to array and calculate percentages
    const classWiseData = Object.values(subjectStats).map(stat => ({
      ...stat,
      attendancePercentage: stat.totalSessions > 0 
        ? ((stat.presentCount / stat.totalSessions) * 100).toFixed(1)
        : 0
    })).sort((a, b) => parseFloat(b.attendancePercentage) - parseFloat(a.attendancePercentage));

    res.status(200).json({
      success: true,
      data: classWiseData
    });

  } catch (error) {
    logger.error('Error fetching student class-wise attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class-wise attendance',
      error: error.message
    });
  }
};

// Get student's enrolled classes
const getStudentClasses = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find user and get student profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const student = await Student.findOne({ 
      $or: [
        { Email: user.email },
        { FullName: user.name }
      ]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Find all active classes where student is enrolled
    const classes = await AcademicClass.find({
      Students: student._id,
      Status: { $in: ['active', 'ongoing'] }
    })
    .populate('Subject', 'SubjectName SubjectCode')
    .populate('Teacher', 'FullName EmployeeId')
    .select('ClassName ClassCode Section Subject Teacher Schedule Status')
    .lean();

    res.status(200).json({
      success: true,
      data: classes,
      count: classes.length
    });

  } catch (error) {
    logger.error('Error fetching student classes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student classes',
      error: error.message
    });
  }
};

// Get student's enrolled classes with attendance details
const getStudentClassesWithAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find user and get student profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const student = await Student.findOne({ 
      $or: [
        { Email: user.email },
        { FullName: user.name }
      ]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Find all classes where student is enrolled
    const classes = await AcademicClass.find({
      Students: student._id
    })
    .populate('Subject', 'SubjectName SubjectCode')
    .populate('Teacher', 'FullName EmployeeId Email')
    .select('ClassName ClassCode Section Subject Teacher Schedule Status Semester')
    .lean();

    // For each class, get attendance statistics
    const classesWithAttendance = await Promise.all(
      classes.map(async (cls) => {
        // Get all attendance sessions for this class and student
        const attendanceSessions = await Attendance.find({
          AcademicClass: cls._id,
          Status: 'finalized',
          'FinalAttendanceRecords.Student': student._id
        })
        .select('Date SessionId SessionType FinalAttendanceRecords')
        .sort({ Date: -1 })
        .lean();

        // Calculate stats
        let presentCount = 0;
        let absentCount = 0;
        const attendanceHistory = [];

        attendanceSessions.forEach(session => {
          const studentRecord = session.FinalAttendanceRecords.find(
            r => r.Student.toString() === student._id.toString()
          );

          if (studentRecord) {
            const status = studentRecord.FinalStatus;
            if (status === 'present') {
              presentCount++;
            } else {
              absentCount++;
            }

            attendanceHistory.push({
              sessionId: session.SessionId,
              date: session.Date,
              createdAt: session.createdAt,
              status: status,
              sessionType: session.SessionType,
              presenceCount: studentRecord.PresenceCount || 0,
              snapshotsPresent: studentRecord.SnapshotsPresent || []
            });
          }
        });

        const totalSessions = presentCount + absentCount;
        const attendancePercentage = totalSessions > 0
          ? ((presentCount / totalSessions) * 100).toFixed(1)
          : 0;

        return {
          classId: cls._id,
          className: `${cls.ClassName} ${cls.Section || ''}`.trim(),
          classCode: cls.ClassCode,
          subject: {
            name: cls.Subject?.SubjectName || 'Unknown',
            code: cls.Subject?.SubjectCode || ''
          },
          teacher: {
            name: cls.Teacher?.FullName || 'Unknown',
            employeeId: cls.Teacher?.EmployeeId,
            email: cls.Teacher?.Email
          },
          schedule: cls.Schedule,
          semester: cls.Semester,
          status: cls.Status,
          attendance: {
            totalSessions,
            presentCount,
            absentCount,
            attendancePercentage: parseFloat(attendancePercentage),
            history: attendanceHistory
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      data: classesWithAttendance,
      count: classesWithAttendance.length
    });

  } catch (error) {
    logger.error('Error fetching student classes with attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classes',
      error: error.message
    });
  }
};

module.exports = {
  getStudentOverallStats,
  getStudentRecentAbsences,
  getStudentClassWiseAttendance,
  getStudentClasses,
  getStudentClassesWithAttendance
};
