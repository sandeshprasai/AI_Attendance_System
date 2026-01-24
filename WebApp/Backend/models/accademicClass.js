const mongoose = require("mongoose");

const academicClassSchema = new mongoose.Schema({
  groupCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  dpeartmentID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "departments",
    required: false,
  },
  YearofEnrollment: {
    required: true,
    type: Number,
    validate: {
      validator: Number.isInteger,
      message: (props) => {
        `Enrolled Year must be in integer format`;
      },
    },
  },
  subjects: [
    {
      type: String,
      required: true,
      default: [],
    },
  ],
  section: {
    type: String,
    required: true,
    trim: true,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subjects",
    },
  ],
});

module.exports = mongoose.model("AccademicClass", academicClassSchema);