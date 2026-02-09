const { required, boolean } = require("joi");
const mongoose = require("mongoose");

const users = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
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
    },
    otpExpiry: {
      type: Date,
    },
    otpUsed: {
      type: Boolean,
      default: false,
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
