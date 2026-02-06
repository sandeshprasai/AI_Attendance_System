const mongoose = require("mongoose");
const { validate } = require("./department");

const subjectSchema = new mongoose.Schema(
  {
    SubjectCode: {
      type: String,
      required: true,
    },

    SubjectName: {
      type: String,
      required: true,
      maxlength: 100,
      trim: true,
    },
    Semester: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      validate: {
        validator: Number.isInteger,
        message: (props) => {
          `Class capacity must be an integer. Current value: ${props.value}`;
        },
      },
    },

    DepartmentID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Departments",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
// ✅ Compound indexes for uniqueness per department
subjectSchema.index({ DepartmentID: 1, SubjectCode: 1 }, { unique: true });
subjectSchema.index({ DepartmentID: 1, SubjectName: 1 }, { unique: true });


module.exports = mongoose.model("Subjects", subjectSchema);
