const mongoose = require("mongoose");

const students = new mongoose.Schema(
  {
    FullName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },

    RollNo: {
      type: Number,
      required: true,
      min: 1,
      unique: true,
    },

    Faculty: {
      type: String,
      required: true,
      trim: true,
      enum: {
        values: [
          "CIVIL",
          "COMPUTER",
          "BE IT",
          "BBA",
          "ARCHITECTURE",
          "ELECTRONICS",
          "BE SOFTWARE",
          "BE INFORMATION",
        ],
        message: "{VALUE} is not a valid faculty",
      },
    },

    YearOfEnrollment: {
      type: Number,
      required: true,
      min: 2000,
      max: new Date().getFullYear(),
    },

    Email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },

    Phone: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"],
    },

    DateOfBirth: {
      type: Date,
      required: true,
      validate: {
        validator: function (dob) {
          return dob < new Date();
        },
        message: "Date of birth must be in the past",
      },
    },
    GuardianName: {
      type: String,
      required: false,
      trim: true,
      maxLength: 100,
    },
    GuardianPhone: {
      type: String,
      required: false,
      match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"],
    },
    Class: {
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

    FullAddress: {
      type: String,
      required: true,
      trim: true,
    },

    UniversityReg: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    ProfileImagePath: {
      type: String,
      default: null,
      trim: true,
    },

    CloudinaryPublicId: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("students", students);
