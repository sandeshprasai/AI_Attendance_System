const mongoose = require("mongoose");

const teachersSchema = new mongoose.Schema(
  {
    EmployeeId: {
      type: String,
    },

    FullName: {
      type: String,
    },

    DateOfBirth: {
      type: String,
    },

    FullAddress: {
      type: String,
    },

    Phone: {
      type: String,
    },

    Email: {
      type: String,
    },

    Faculty: {
      type: String,
      enum: [
        "Civil Engineering",
        "Computer Engineering",
        "IT Engineering",
        "Electronics & Communication",
        "BBA",
        "Architecture",
      ],
    },

    Subject: {
      type: String,
      enum: [
        "Mathematics",
        "Physics",
        "Chemistry",
        "Operating System",
        "English",
        "DSA",
        "ICT PM",
        "OOP in C++",
        "Economics",
        "SPIT",
        "Cloud Computing",
        "Programming in C",
      ],
    },

    JoinedYear: {
      type: String,
    },

    ProfileImagePath: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Teachers", teachersSchema);