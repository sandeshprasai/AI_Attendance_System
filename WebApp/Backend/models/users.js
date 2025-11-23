const mongoose = require("mongoose");

const users = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("users", users);
