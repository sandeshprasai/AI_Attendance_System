const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const attendanceSchema = new mongoose.Schema(
  {
    SessionId: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
    },

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

    SessionType: {
      type: String,
      enum: ["lecture", "lab", "tutorial", "other"],
      default: "lecture",
    },

    Status: {
      type: String,
      enum: ["in_progress", "finalized", "draft"],
      default: "in_progress",
    },

    TotalStudents: {
      type: Number,
      required: true,
      min: 0,
    },

    RequiredSnapshots: {
      type: Number,
      default: 4,
      min: 1,
      max: 10,
    },

    Snapshots: [
      {
        SnapshotNumber: {
          type: Number,
          required: true,
          min: 1,
        },
        Timestamp: {
          type: Date,
          required: true,
          default: Date.now,
        },
        RecognizedStudents: [
          {
            Student: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "students",
              required: true,
            },
            Status: {
              type: String,
              enum: ["present", "absent", "late"],
              default: "present",
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
      },
    ],

    FinalAttendanceRecords: [
      {
        Student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "students",
          required: true,
        },
        PresenceCount: {
          type: Number,
          default: 0,
          min: 0,
        },
        FinalStatus: {
          type: String,
          enum: ["present", "absent"],
          default: "absent",
        },
        SnapshotsPresent: {
          type: [Number],
          default: [],
        },
        Remarks: {
          type: String,
          maxLength: 200,
          trim: true,
        },
      },
    ],

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
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
// Note: SessionId already has unique: true in schema definition (line 9)
// Compound indexes with Date removed to allow multiple sessions per day
attendanceSchema.index({ AcademicClass: 1 });
attendanceSchema.index({ Subject: 1 });
attendanceSchema.index({ Teacher: 1 });
attendanceSchema.index({ Date: 1 });
attendanceSchema.index({ Status: 1 });

// Method to add a snapshot
attendanceSchema.methods.addSnapshot = function (snapshotNumber, recognizedStudents) {
  const existingIndex = this.Snapshots.findIndex(
    (s) => s.SnapshotNumber === snapshotNumber
  );

  const snapshotData = {
    SnapshotNumber: snapshotNumber,
    Timestamp: new Date(),
    RecognizedStudents: recognizedStudents,
  };

  if (existingIndex >= 0) {
    this.Snapshots[existingIndex] = snapshotData;
  } else {
    this.Snapshots.push(snapshotData);
  }

  // Sort snapshots by number
  this.Snapshots.sort((a, b) => a.SnapshotNumber - b.SnapshotNumber);
};

// Method to calculate final attendance
attendanceSchema.methods.calculateFinalAttendance = function (threshold = 3) {
  const studentPresenceMap = new Map();

  // Count presence for each student across all snapshots
  this.Snapshots.forEach((snapshot) => {
    snapshot.RecognizedStudents.forEach((record) => {
      const studentId = record.Student.toString();
      if (!studentPresenceMap.has(studentId)) {
        studentPresenceMap.set(studentId, {
          count: 0,
          snapshots: [],
          student: record.Student,
        });
      }

      // Count "present" and "late" as present
      if (record.Status === "present" || record.Status === "late") {
        const data = studentPresenceMap.get(studentId);
        data.count += 1;
        data.snapshots.push(snapshot.SnapshotNumber);
      }
    });
  });

  // Calculate threshold based on total snapshots taken
  const totalSnapshots = this.Snapshots.length;
  const dynamicThreshold = Math.ceil(totalSnapshots * 0.75); // 75% presence required

  // Build final attendance records
  this.FinalAttendanceRecords = Array.from(studentPresenceMap.entries()).map(
    ([studentId, data]) => ({
      Student: data.student,
      PresenceCount: data.count,
      FinalStatus: data.count >= dynamicThreshold ? "present" : "absent",
      SnapshotsPresent: data.snapshots,
    })
  );

  // Calculate aggregate statistics
  this.PresentCount = this.FinalAttendanceRecords.filter(
    (r) => r.FinalStatus === "present"
  ).length;
  this.AbsentCount = this.TotalStudents - this.PresentCount;
  this.AttendancePercentage =
    this.TotalStudents > 0
      ? Math.round((this.PresentCount / this.TotalStudents) * 100)
      : 0;
};

// Pre-save middleware to auto-calculate if all snapshots are complete
attendanceSchema.pre("save", function (next) {
  if (
    this.Snapshots.length >= this.RequiredSnapshots &&
    this.Status === "in_progress"
  ) {
    this.calculateFinalAttendance();
    this.Status = "finalized";
  }
  next();
});

module.exports = mongoose.model("Attendance", attendanceSchema);
