const mongoose = require("mongoose");

const teachersSchema = new mongoose.Schema(
  {
    EmployeeId: {
      type: String,
      unique: true, // ensures no duplicates in the database
      required: true, // optional, ensures this field is always provided
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
      required: true,
    },

    Subjects: {
      type: [mongoose.Schema.Types.ObjectId],
      required: true,
      ref: "Subjects",
    },
    Classroom: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "classes",
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
  },
);

module.exports = mongoose.model("Teachers", teachersSchema);
