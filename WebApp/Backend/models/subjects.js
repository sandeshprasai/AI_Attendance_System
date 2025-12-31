const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    SubjectCode: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: (props) => `${props.value} must be an integer value`,
      },
    },

    SubjectName: {
      type: String,
      required: true,
      unique: true,
      maxlength: 100,
      trim: true,
    },

    DepartmentID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Departments",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Subjects", subjectSchema);
