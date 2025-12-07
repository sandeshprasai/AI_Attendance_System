const { required } = require("joi");
const mongoose = require("mongoose");

const teachers = new mongoose.Schema(
  {
    FullName: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      required: true,
      unique: true,
    },
    Phone: {
      type: String,
      required: true,
      unique: true,
    },
    ProfileImagePath: {
      type: String,
      required: true,
    },
    Departments: [String],
    assignedClasses: [
      {
        type: [Number],
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Teachers", teachers);
