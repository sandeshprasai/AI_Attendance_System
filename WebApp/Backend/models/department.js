const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    DepartmentCode: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: (props) => `${props.value} must be an integer value`,
      },
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
