const AbsentNotification = require("../models/absentNotification");
const Attendance = require("../models/attendance");
const Student = require("../models/students");
const AcademicClass = require("../models/accademicClass");
const {
  sendAbsenceNotification,
  sendExcusedConfirmation,
} = require("../Utills/emailService");

/**
 * Get all absent notifications with filters
 */
const getAllAbsentNotifications = async (req, res) => {
  try {
    const {
      status,
      date,
      classId,
      page = 1,
      limit = 50,
      sortBy = "-date",
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }
    if (classId) filter.academicClass = classId;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch notifications with populated data
    const notifications = await AbsentNotification.find(filter)
      .populate({
        path: "student",
        select: "FullName Email RollNo GuardianPhone Phone",
      })
      .populate({
        path: "academicClass",
        select: "ClassName Section",
      })
      .populate({
        path: "attendance",
        select: "Subject Date SessionType",
        populate: {
          path: "Subject",
          select: "SubjectName SubjectCode",
        },
      })
      .populate({
        path: "excusedBy",
        select: "FullName Email",
      })
      .populate({
        path: "notificationSentBy",
        select: "FullName Email",
      })
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await AbsentNotification.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Absent notifications retrieved successfully",
      data: {
        notifications,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching absent notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch absent notifications",
      error: error.message,
    });
  }
};

/**
 * Get today's absent notifications
 */
const getTodayAbsentNotifications = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const notifications = await AbsentNotification.find({
      date: { $gte: today, $lt: tomorrow },
    })
      .populate({
        path: "student",
        select: "FullName Email RollNo GuardianPhone Phone",
      })
      .populate({
        path: "academicClass",
        select: "ClassName Section",
      })
      .populate({
        path: "attendance",
        select: "Subject Date SessionType",
        populate: {
          path: "Subject",
          select: "SubjectName SubjectCode",
        },
      })
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      message: "Today's absent notifications retrieved successfully",
      data: notifications,
    });
  } catch (error) {
    console.error("Error fetching today's notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch today's notifications",
      error: error.message,
    });
  }
};

/**
 * Get single absent notification by ID
 */
const getAbsentNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await AbsentNotification.findById(id)
      .populate({
        path: "student",
        select: "FullName Email RollNo GuardianPhone Phone",
      })
      .populate({
        path: "academicClass",
        select: "ClassName Section",
      })
      .populate({
        path: "attendance",
        select: "Subject Date SessionType Teacher",
        populate: [
          { path: "Subject", select: "SubjectName SubjectCode" },
          { path: "Teacher", select: "FullName Email" },
        ],
      })
      .populate({
        path: "excusedBy",
        select: "FullName Email",
      })
      .populate({
        path: "notificationSentBy",
        select: "FullName Email",
      });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification retrieved successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Error fetching notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notification",
      error: error.message,
    });
  }
};

/**
 * Send notification to student
 */
const notifyParent = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentEmail } = req.body; // Optional override
    const userId = req.user._id;

    // Find notification
    const notification = await AbsentNotification.findById(id)
      .populate("student", "FullName Email RollNo GuardianPhone Phone")
      .populate("academicClass", "ClassName Section")
      .populate({
        path: "attendance",
        populate: { path: "Subject", select: "SubjectName SubjectCode" },
      });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Use student's email
    const emailToUse = studentEmail || notification.student.Email;

    if (!emailToUse) {
      return res.status(400).json({
        success: false,
        message: "Student email not found. Please provide an email address.",
      });
    }

    // Send email to student
    await sendAbsenceNotification({
      studentEmail: emailToUse,
      studentName: notification.student.FullName,
      rollNumber: notification.student.RollNo,
      className: `${notification.academicClass.ClassName} ${notification.academicClass.Section || ''}`.trim(),
      date: notification.date,
      subject: notification.attendance?.Subject?.SubjectName || "N/A",
    });

    // Update notification record
    notification.recordNotification(userId, emailToUse);
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Student notification sent successfully",
      data: {
        emailSent: emailToUse,
        sentAt: notification.notificationSentAt,
      },
    });
  } catch (error) {
    console.error("Error sending student notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send notification",
      error: error.message,
    });
  }
};

/**
 * Mark absence as excused
 */
const markAsExcused = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, sendEmail } = req.body;
    const userId = req.user._id;

    // Find notification
    const notification = await AbsentNotification.findById(id)
      .populate("student", "FullName Email RollNo GuardianPhone")
      .populate("academicClass", "ClassName Section")
      .populate("attendance");

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Mark as excused
    notification.markAsExcused(reason, userId);
    await notification.save();

    // Optionally send confirmation email to student
    if (sendEmail && notification.student?.Email) {
      try {
        await sendExcusedConfirmation({
          studentEmail: notification.student.Email,
          studentName: notification.student.FullName,
          rollNumber: notification.student.RollNo,
          className: `${notification.academicClass.ClassName} ${notification.academicClass.Section || ''}`.trim(),
          date: notification.date,
          reason: reason,
        });
      } catch (emailError) {
        console.error("Failed to send excused confirmation:", emailError);
        // Don't fail the request if email fails
      }
    }

    res.status(200).json({
      success: true,
      message: "Absence marked as excused successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Error marking as excused:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark as excused",
      error: error.message,
    });
  }
};

/**
 * Create absent notifications for finalized attendance
 * This will be called automatically when attendance is finalized
 */
const createAbsentNotifications = async (attendanceId) => {
  try {
    const attendance = await Attendance.findById(attendanceId)
      .populate("AcademicClass")
      .populate("Subject");

    if (!attendance || attendance.Status !== "finalized") {
      return;
    }

    // Get absent students from final records
    const absentStudents = attendance.FinalAttendanceRecords.filter(
      (record) => record.FinalStatus === "absent"
    );

    // Create notifications for each absent student
    const notifications = [];
    for (const record of absentStudents) {
      // Check if notification already exists
      const existingNotification = await AbsentNotification.findOne({
        student: record.Student,
        attendance: attendanceId,
        date: attendance.Date,
      });

      if (!existingNotification) {
        const notification = new AbsentNotification({
          student: record.Student,
          attendance: attendanceId,
          academicClass: attendance.AcademicClass._id,
          date: attendance.Date,
          status: "pending",
        });

        await notification.save();
        notifications.push(notification);
      }
    }

    console.log(
      `✅ Created ${notifications.length} absent notifications for attendance ${attendanceId}`
    );
    return notifications;
  } catch (error) {
    console.error("Error creating absent notifications:", error);
    throw error;
  }
};

/**
 * Bulk notify parents for multiple notifications
 */
const bulkNotifyParents = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of notification IDs",
      });
    }

    const results = {
      success: [],
      failed: [],
    };

    for (const id of notificationIds) {
      try {
        const notification = await AbsentNotification.findById(id)
          .populate("student", "FullName Email GuardianPhone")
          .populate("academicClass", "ClassName Section")
          .populate({
            path: "attendance",
            populate: { path: "Subject", select: "SubjectName SubjectCode" },
          });

        if (!notification) {
          results.failed.push({ id, reason: "Notification not found" });
          continue;
        }

        const emailToUse = notification.student.Email;

        if (!emailToUse) {
          results.failed.push({ id, reason: "No student email available" });
          continue;
        }

        await sendAbsenceNotification({
          studentEmail: emailToUse,
          studentName: notification.student.FullName,
          rollNumber: notification.student.RollNo,
          className: `${notification.academicClass.ClassName} ${notification.academicClass.Section || ''}`.trim(),
          date: notification.date,
          subject: notification.attendance?.Subject?.SubjectName || "N/A",
        });

        notification.recordNotification(userId, emailToUse);
        await notification.save();

        results.success.push(id);
      } catch (error) {
        results.failed.push({ id, reason: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk notification completed. Success: ${results.success.length}, Failed: ${results.failed.length}`,
      data: results,
    });
  } catch (error) {
    console.error("Error in bulk notify:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process bulk notifications",
      error: error.message,
    });
  }
};

/**
 * Sync/create absent notifications from finalized attendance
 * This can be called manually to create notifications for existing attendance records
 */
const syncAbsentNotifications = async (req, res) => {
  try {
    const { date } = req.query;
    
    let queryDate = new Date();
    if (date) {
      queryDate = new Date(date);
    }

    // Get start and end of day
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find all finalized attendance for the date
    const attendanceRecords = await Attendance.find({
      Date: { $gte: startOfDay, $lte: endOfDay },
      Status: 'finalized'
    });

    let created = 0;
    let skipped = 0;

    for (const attendance of attendanceRecords) {
      try {
        const notifications = await createAbsentNotifications(attendance._id);
        created += notifications.length;
      } catch (error) {
        console.error(`Failed to create notifications for ${attendance._id}:`, error);
        skipped++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Sync completed. Created ${created} notifications, skipped ${skipped} attendance records.`,
      data: {
        created,
        skipped,
        totalAttendance: attendanceRecords.length
      }
    });
  } catch (error) {
    console.error("Error syncing notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sync notifications",
      error: error.message,
    });
  }
};

module.exports = {
  getAllAbsentNotifications,
  getTodayAbsentNotifications,
  getAbsentNotificationById,
  notifyParent,
  markAsExcused,
  createAbsentNotifications,
  bulkNotifyParents,
  syncAbsentNotifications,
};
