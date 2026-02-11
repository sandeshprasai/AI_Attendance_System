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

        // Normalize date to start of the day (YYYY-MM-DD)
        const recordDate = new Date(date);
        recordDate.setHours(0, 0, 0, 0);

        // Check if attendance record already exists for this class and date
        let attendance = await Attendance.findOne({
            AcademicClass: academicClassId,
            Date: recordDate
        });

        if (attendance) {
            // Update existing record
            attendance.AttendanceRecords = attendanceRecords;
            attendance.SessionType = sessionType || "lecture";
            attendance.Status = "finalized";
            attendance.TotalStudents = academicClass.Students.length;
            // The Subject and Teacher might have changed so update them too
            attendance.Subject = academicClass.Subject;
            attendance.Teacher = academicClass.Teacher;

            await attendance.save(); // This triggers pre-save middleware
            logger.info(`Attendance updated successfully | ID: ${attendance._id} | IP: ${req.ip}`);
        } else {
            // Create new record
            const attendanceData = {
                AcademicClass: academicClassId,
                Date: recordDate,
                Subject: academicClass.Subject,
                Teacher: academicClass.Teacher,
                TotalStudents: academicClass.Students.length,
                AttendanceRecords: attendanceRecords,
                SessionType: sessionType || "lecture",
                Status: "finalized",
            };

            attendance = new Attendance(attendanceData);
            await attendance.save(); // This triggers pre-save middleware
            logger.info(`Attendance created successfully | ID: ${attendance._id} | IP: ${req.ip}`);
        }

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
