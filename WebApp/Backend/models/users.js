const { required } = require("joi");
const mongoose = require("mongoose");

const users = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "teacher", "student"],
    },
    otp: {
      type: String,
      minLength: 6,
    },
    otpExpiry: {
      type: Date,
    },
    ProfileImagePath: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("users", users);
