const mongoose = require("mongoose");
const { validate } = require("./department");

const subjectSchema = new mongoose.Schema(
  {
    SubjectCode: {
      type: String,
      required: true,
      unique: true,
    },

    SubjectName: {
      type: String,
      required: true,
      unique: true,
      maxlength: 100,
      trim: true,
    },
    Semester: {
      type: Number,
      min: 1,
      max: 8,
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

module.exports = mongoose.model("Subjects", subjectSchema);
