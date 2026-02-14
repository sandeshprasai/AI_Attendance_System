const express = require("express");
const router = express.Router();
const {
  getAllAbsentNotifications,
  getTodayAbsentNotifications,
  getAbsentNotificationById,
  notifyParent,
  markAsExcused,
  bulkNotifyParents,
  syncAbsentNotifications,
} = require("../controllers/absentNotificationController");
const allowAdminAccess = require("../middlewares/adminAccessControl");
const allowTeacherAndAdmin = require("../middlewares/teacherAdminAccessControl");

// Get all absent notifications with filters (admin/teacher)
router.get("/", allowTeacherAndAdmin, getAllAbsentNotifications);

// Get today's absent notifications (admin/teacher)
router.get("/today", allowTeacherAndAdmin, getTodayAbsentNotifications);

// Sync/create notifications from existing attendance (admin only)
router.post("/sync", allowAdminAccess, syncAbsentNotifications);

// Bulk notify parents (admin only) - MUST be before /:id routes
router.post("/bulk/notify", allowAdminAccess, bulkNotifyParents);

// Get single notification by ID (admin/teacher)
router.get("/:id", allowTeacherAndAdmin, getAbsentNotificationById);

// Send notification to parent (admin only)
router.post("/:id/notify", allowAdminAccess, notifyParent);

// Mark absence as excused (admin only)
router.patch("/:id/excuse", allowAdminAccess, markAsExcused);

module.exports = router;
