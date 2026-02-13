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

module.exports = {
  getTodayAttendanceAnalytics,
  getAbsentStudentsList
};
