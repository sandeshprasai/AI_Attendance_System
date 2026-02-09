const mongoose = require("mongoose");

const academicClassSchema = new mongoose.Schema(
  {
    ClassName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },

    ClassCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    PhysicalClassroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },

    Department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Departments",
      required: true,
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

    Students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "students",
      },
    ],

    Semester: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      validate: {
        validator: Number.isInteger,
        message: "Semester must be an integer",
      },
    },

    AcademicYear: {
      type: String,
      required: true,
      trim: true,
    },

    Section: {
      type: String,
      trim: true,
      uppercase: true,
      maxLength: 2,
    },

    Status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
    },

    MaxCapacity: {
      type: Number,
      default: 48,
      min: 1,
    },

    Description: {
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
academicClassSchema.index({ Department: 1, Semester: 1, AcademicYear: 1 });
academicClassSchema.index({ Subject: 1, Teacher: 1 });
academicClassSchema.index({ Status: 1 });
academicClassSchema.index({ PhysicalClassroom: 1 });

// Validate that students count doesn't exceed classroom capacity
academicClassSchema.pre("save", async function (next) {
  if (this.Students && this.Students.length > this.MaxCapacity) {
    return next(
      new Error(
        `Cannot assign ${this.Students.length} students. Maximum capacity is ${this.MaxCapacity}`
      )
    );
  }
  next();
});

module.exports = mongoose.model("AcademicClass", academicClassSchema);