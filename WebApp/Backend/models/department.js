const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    DepartmentCode: {
      type: String,
      required: true,
    },

    DepartmentName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Departments", departmentSchema);
