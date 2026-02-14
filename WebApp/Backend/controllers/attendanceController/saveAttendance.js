const Attendance = require("../../models/attendance");
const AcademicClass = require("../../models/accademicClass");
const logger = require("../../logger/logger");
const { logAttendanceMarked } = require("../../Utills/activityLogger");
const { parseAndNormalizeKathmanduDate } = require("../../Utills/timezoneHelper");
const { createAbsentNotifications } = require("../absentNotificationController");

// Save individual snapshot (1-4) during lecture
const saveAttendanceSnapshot = async (req, res) => {
    try {
        const { sessionId, academicClassId, date, snapshotNumber, recognizedStudents, sessionType, requiredSnapshots } = req.body;

        logger.info(`Save snapshot | Session: ${sessionId} | Class: ${academicClassId} | Snapshot: ${snapshotNumber} | IP: ${req.ip}`);

        // Validation
        if (!academicClassId || !date || !snapshotNumber || !recognizedStudents) {
            return res.status(400).json({
                success: false,
                message: "Academic Class ID, Date, Snapshot Number, and Recognized Students are required",
            });
        }

        if (snapshotNumber < 1 || snapshotNumber > 10) {
            return res.status(400).json({
                success: false,
                message: "Snapshot number must be between 1 and 10",
            });
        }

        // Check if class exists
        const academicClass = await AcademicClass.findById(academicClassId).populate('Students');
        if (!academicClass) {
            return res.status(404).json({
                success: false,
                message: "Academic class not found",
            });
        }

        // Normalize date to start of the day in Kathmandu timezone
        const recordDate = parseAndNormalizeKathmanduDate(date);

        let attendance;

        if (sessionId) {
            // Find existing session by sessionId
            attendance = await Attendance.findOne({ SessionId: sessionId });
        }

        if (!attendance) {
            // Create new attendance session
            const attendanceData = {
                AcademicClass: academicClassId,
                Date: recordDate,
                Subject: academicClass.Subject,
                Teacher: academicClass.Teacher,
                TotalStudents: academicClass.Students.length,
                SessionType: sessionType || "lecture",
                RequiredSnapshots: requiredSnapshots || 4,
                Status: "in_progress",
                Snapshots: [],
            };

            attendance = new Attendance(attendanceData);
            logger.info(`New attendance session created | SessionId: ${attendance.SessionId} | IP: ${req.ip}`);
        }

        // Add the snapshot
        attendance.addSnapshot(snapshotNumber, recognizedStudents);
        await attendance.save(); // Auto-finalizes if all snapshots complete

        return res.status(200).json({
            success: true,
            message: `Snapshot ${snapshotNumber} saved successfully`,
            data: {
                sessionId: attendance.SessionId,
                snapshotsCompleted: attendance.Snapshots.length,
                requiredSnapshots: attendance.RequiredSnapshots,
                status: attendance.Status,
                attendance: attendance,
            },
        });

    } catch (error) {
        logger.error(`Save snapshot failed | Error: ${error.message} | IP: ${req.ip}`);
        return res.status(500).json({
            success: false,
            message: "Internal server error while saving snapshot",
            error: error.message,
        });
    }
};

// Manually finalize attendance (if teacher wants to finish early)
const finalizeAttendance = async (req, res) => {
    try {
        const { sessionId } = req.body;

        logger.info(`Finalize attendance request | Session: ${sessionId} | IP: ${req.ip}`);

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: "Session ID is required",
            });
        }

        const attendance = await Attendance.findOne({ SessionId: sessionId });
        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "Attendance session not found",
            });
        }

        if (attendance.Status === "finalized") {
            return res.status(400).json({
                success: false,
                message: "Attendance already finalized",
            });
        }

        if (attendance.Snapshots.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No snapshots recorded yet",
            });
        }

        // Calculate final attendance based on snapshots taken
        attendance.calculateFinalAttendance();
        attendance.Status = "finalized";
        await attendance.save();

        logger.info(`Attendance finalized | SessionId: ${sessionId} | Present: ${attendance.PresentCount} | Absent: ${attendance.AbsentCount} | IP: ${req.ip}`);

        // Create absent notifications for students marked absent
        try {
          await createAbsentNotifications(attendance._id);
          logger.info(`Absent notifications created for session: ${sessionId}`);
        } catch (notificationError) {
          logger.warn("Failed to create absent notifications:", notificationError);
          // Don't fail the request if notification creation fails
        }

        // Log activity
        try {
          const academicClass = await AcademicClass.findById(attendance.AcademicClass).populate('ClassName');
          await logAttendanceMarked(
            attendance.AcademicClass,
            academicClass?.ClassName || 'Unknown Class',
            req.user?._id || null,
            {
              sessionId: attendance.SessionId,
              present: attendance.PresentCount,
              absent: attendance.AbsentCount,
              totalStudents: attendance.TotalStudents,
              date: attendance.Date
            }
          );
        } catch (logError) {
          logger.warn("Failed to log activity:", logError);
        }

        return res.status(200).json({
            success: true,
            message: "Attendance finalized successfully",
            data: attendance,
        });

    } catch (error) {
        logger.error(`Finalize attendance failed | Error: ${error.message} | IP: ${req.ip}`);
        return res.status(500).json({
            success: false,
            message: "Internal server error while finalizing attendance",
            error: error.message,
        });
    }
};

// Legacy endpoint for backward compatibility (save complete attendance at once)
const saveAttendance = async (req, res) => {
    try {
        const { academicClassId, date, attendanceRecords, sessionType } = req.body;

        logger.info(`Save attendance request (legacy) | Class: ${academicClassId} | Date: ${date} | IP: ${req.ip}`);

        if (!academicClassId || !date || !attendanceRecords) {
            return res.status(400).json({
                success: false,
                message: "Academic Class ID, Date, and Attendance Records are required",
            });
        }

        // Check if class exists
        const academicClass = await AcademicClass.findById(academicClassId);
        if (!academicClass) {
            return res.status(404).json({
                success: false,
                message: "Academic class not found",
            });
        }

        // Normalize date to start of the day in Kathmandu timezone (YYYY-MM-DD)
        const recordDate = parseAndNormalizeKathmanduDate(date);

        // Create new attendance session with single snapshot
        const attendanceData = {
            AcademicClass: academicClassId,
            Date: recordDate,
            Subject: academicClass.Subject,
            Teacher: academicClass.Teacher,
            TotalStudents: academicClass.Students.length,
            SessionType: sessionType || "lecture",
            RequiredSnapshots: 1,
            Status: "finalized",
            Snapshots: [
                {
                    SnapshotNumber: 1,
                    Timestamp: new Date(),
                    RecognizedStudents: attendanceRecords,
                }
            ],
        };

        const attendance = new Attendance(attendanceData);
        attendance.calculateFinalAttendance();
        await attendance.save();

        logger.info(`Attendance created successfully | ID: ${attendance._id} | IP: ${req.ip}`);

        return res.status(200).json({
            success: true,
            message: "Attendance saved successfully",
            data: attendance,
        });

    } catch (error) {
        logger.error(`Save attendance failed | Error: ${error.message} | IP: ${req.ip}`);
        return res.status(500).json({
            success: false,
            message: "Internal server error while saving attendance",
            error: error.message,
        });
    }
};

const getAttendanceByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const { startDate, endDate, status } = req.query;

        logger.info(`Fetch attendance history | Class: ${classId} | IP: ${req.ip}`);

        const query = { AcademicClass: classId };

        // Optional date range filter
        if (startDate || endDate) {
            query.Date = {};
            if (startDate) query.Date.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.Date.$lte = end;
            }
        }

        // Optional status filter
        if (status) {
            query.Status = status;
        }

        const history = await Attendance.find(query)
            .populate('Subject', 'SubjectName SubjectCode')
            .populate('Teacher', 'FullName EmployeeId')
            .sort({ Date: -1, createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (error) {
        logger.error(`Fetch attendance history failed | Error: ${error.message} | IP: ${req.ip}`);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching attendance history",
        });
    }
};

// Get attendance by subject
const getAttendanceBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const { startDate, endDate, status } = req.query;

        logger.info(`Fetch attendance by subject | Subject: ${subjectId} | IP: ${req.ip}`);

        const query = { Subject: subjectId };

        // Optional date range filter
        if (startDate || endDate) {
            query.Date = {};
            if (startDate) query.Date.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.Date.$lte = end;
            }
        }

        // Optional status filter
        if (status) {
            query.Status = status;
        }

        const history = await Attendance.find(query)
            .populate('AcademicClass', 'ClassName ClassCode Section')
            .populate('Teacher', 'FullName EmployeeId')
            .sort({ Date: -1, createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (error) {
        logger.error(`Fetch attendance by subject failed | Error: ${error.message} | IP: ${req.ip}`);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching attendance by subject",
        });
    }
};

// Get specific attendance session details
const getAttendanceSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        logger.info(`Fetch attendance session | SessionId: ${sessionId} | IP: ${req.ip}`);

        const attendance = await Attendance.findOne({ SessionId: sessionId })
            .populate('AcademicClass', 'ClassName ClassCode Section')
            .populate('Subject', 'SubjectName SubjectCode')
            .populate('Teacher', 'FullName EmployeeId')
            .populate('Snapshots.RecognizedStudents.Student', 'FullName RollNo Email')
            .populate('FinalAttendanceRecords.Student', 'FullName RollNo Email');

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "Attendance session not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: attendance
        });
    } catch (error) {
        logger.error(`Fetch attendance session failed | Error: ${error.message} | IP: ${req.ip}`);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching attendance session",
        });
    }
};

// Get student attendance report
const getStudentAttendanceReport = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { subjectId, startDate, endDate } = req.query;

        logger.info(`Fetch student attendance report | Student: ${studentId} | IP: ${req.ip}`);

        const query = {
            Status: "finalized",
            "FinalAttendanceRecords.Student": studentId
        };

        if (subjectId) {
            query.Subject = subjectId;
        }

        if (startDate || endDate) {
            query.Date = {};
            if (startDate) query.Date.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.Date.$lte = end;
            }
        }

        const sessions = await Attendance.find(query)
            .populate('Subject', 'SubjectName SubjectCode')
            .populate('AcademicClass', 'ClassName ClassCode')
            .sort({ Date: -1 });

        // Extract student-specific records
        const report = sessions.map(session => {
            const studentRecord = session.FinalAttendanceRecords.find(
                r => r.Student.toString() === studentId
            );

            return {
                sessionId: session.SessionId,
                date: session.Date,
                subject: session.Subject,
                academicClass: session.AcademicClass,
                sessionType: session.SessionType,
                presenceCount: studentRecord?.PresenceCount || 0,
                totalSnapshots: session.Snapshots.length,
                status: studentRecord?.FinalStatus || "absent",
                snapshotsPresent: studentRecord?.SnapshotsPresent || [],
            };
        });

        const totalSessions = report.length;
        const presentSessions = report.filter(r => r.status === "present").length;
        const attendancePercentage = totalSessions > 0 
            ? Math.round((presentSessions / totalSessions) * 100) 
            : 0;

        return res.status(200).json({
            success: true,
            data: {
                studentId,
                totalSessions,
                presentSessions,
                absentSessions: totalSessions - presentSessions,
                attendancePercentage,
                sessions: report
            }
        });
    } catch (error) {
        logger.error(`Fetch student attendance report failed | Error: ${error.message} | IP: ${req.ip}`);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching student attendance report",
        });
    }
};

module.exports = {
    saveAttendanceSnapshot,
    finalizeAttendance,
    saveAttendance,
    getAttendanceByClass,
    getAttendanceBySubject,
    getAttendanceSession,
    getStudentAttendanceReport,
};
