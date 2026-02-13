const mongoose = require("mongoose");

const absentNotificationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "students",
      required: true,
    },
    
    attendance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance",
      required: true,
    },
    
    academicClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicClass",
      required: true,
    },
    
    date: {
      type: Date,
      required: true,
    },
    
    status: {
      type: String,
      enum: ["pending", "notified", "excused"],
      default: "pending",
    },
    
    isExcused: {
      type: Boolean,
      default: false,
    },
    
    excusedReason: {
      type: String,
      maxLength: 500,
      trim: true,
    },
    
    excusedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    
    excusedAt: {
      type: Date,
    },
    
    notificationSent: {
      type: Boolean,
      default: false,
    },
    
    notificationSentAt: {
      type: Date,
    },
    
    notificationSentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    
    parentEmail: {
      type: String,
      trim: true,
    },
    
    emailSentCount: {
      type: Number,
      default: 0,
    },
    
    remarks: {
      type: String,
      maxLength: 500,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
absentNotificationSchema.index({ student: 1, date: 1 });
absentNotificationSchema.index({ academicClass: 1, date: 1 });
absentNotificationSchema.index({ status: 1 });
absentNotificationSchema.index({ date: -1 });

// Method to mark as excused
absentNotificationSchema.methods.markAsExcused = function (reason, userId) {
  this.isExcused = true;
  this.status = "excused";
  this.excusedReason = reason;
  this.excusedBy = userId;
  this.excusedAt = new Date();
};

// Method to record notification sent
absentNotificationSchema.methods.recordNotification = function (userId, email) {
  this.notificationSent = true;
  this.status = "notified";
  this.notificationSentAt = new Date();
  this.notificationSentBy = userId;
  this.parentEmail = email;
  this.emailSentCount += 1;
};

module.exports = mongoose.model("AbsentNotification", absentNotificationSchema);
