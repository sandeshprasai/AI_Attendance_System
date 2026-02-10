const Attendance = require("../../models/attendance");
const AcademicClass = require("../../models/accademicClass");
const logger = require("../../logger/logger");

const saveAttendance = async (req, res) => {
    try {
        const { academicClassId, date, attendanceRecords, sessionType } = req.body;

        logger.info(`Save attendance request | Class: ${academicClassId} | Date: ${date} | IP: ${req.ip}`);

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

        // Prepare data for attendance record
        const attendanceData = {
            AcademicClass: academicClassId,
            Date: new Date(date),
            Subject: academicClass.Subject,
            Teacher: academicClass.Teacher,
            TotalStudents: academicClass.Students.length,
            AttendanceRecords: attendanceRecords,
            SessionType: sessionType || "lecture",
            Status: "finalized",
        };

        // Use findOneAndUpdate with upsert to avoid duplicate records for same class and date
        const updatedAttendance = await Attendance.findOneAndUpdate(
            { AcademicClass: academicClassId, Date: new Date(date) },
            attendanceData,
            { new: true, upsert: true, runValidators: true }
        );

        logger.info(`Attendance saved successfully | ID: ${updatedAttendance._id} | IP: ${req.ip}`);

        return res.status(200).json({
            success: true,
            message: "Attendance saved successfully",
            data: updatedAttendance,
        });

    } catch (error) {
        logger.error(`Save attendance failed | Error: ${error.message} | IP: ${req.ip}`);

        // Handle duplicate key error if not caught by findOneAndUpdate (unlikely but safe)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Attendance for this class on this date already exists",
            });
        }

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
        logger.info(`Fetch attendance history | Class: ${classId} | IP: ${req.ip}`);

        const history = await Attendance.find({ AcademicClass: classId })
            .sort({ Date: -1 });

        return res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        logger.error(`Fetch attendance history failed | Error: ${error.message} | IP: ${req.ip}`);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching attendance history",
        });
    }
}

module.exports = {
    saveAttendance,
    getAttendanceByClass
};
