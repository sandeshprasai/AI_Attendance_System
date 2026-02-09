const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    AcademicClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicClass",
      required: true,
    },

    Date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    Subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subjects",
      required: true,
    },

    Teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teachers",
      required: true,
    },

    AttendanceRecords: [
      {
        Student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "students",
          required: true,
        },
        Status: {
          type: String,
          enum: ["present", "absent", "late", "excused"],
          default: "absent",
        },
        MarkedAt: {
          type: Date,
          default: Date.now,
        },
        Remarks: {
          type: String,
          maxLength: 200,
          trim: true,
        },
      },
    ],

    TotalStudents: {
      type: Number,
      required: true,
      min: 0,
    },

    PresentCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    AbsentCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    AttendancePercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    SessionType: {
      type: String,
      enum: ["lecture", "lab", "tutorial", "other"],
      default: "lecture",
    },

    Status: {
      type: String,
      enum: ["draft", "finalized", "modified"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one attendance record per class per date
attendanceSchema.index({ AcademicClass: 1, Date: 1 }, { unique: true });
attendanceSchema.index({ Subject: 1, Date: 1 });
attendanceSchema.index({ Teacher: 1, Date: 1 });

// Pre-save middleware to calculate attendance statistics
attendanceSchema.pre("save", function (next) {
  const presentCount = this.AttendanceRecords.filter(
    (record) => record.Status === "present" || record.Status === "late"
  ).length;
  const absentCount = this.AttendanceRecords.filter(
    (record) => record.Status === "absent"
  ).length;

  this.PresentCount = presentCount;
  this.AbsentCount = absentCount;
  this.AttendancePercentage =
    this.TotalStudents > 0
      ? Math.round((presentCount / this.TotalStudents) * 100)
      : 0;

  next();
});

module.exports = mongoose.model("Attendance", attendanceSchema);
