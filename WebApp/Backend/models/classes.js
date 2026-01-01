const mongoose = require("mongoose");

const classesSchema = new mongoose.Schema(
  {
    class: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: (props) =>
          `Class number must be a positive integer. Current value: ${props.value}`,
      },
    },

    capacity: {
      type: Number,
      required: true,
      validate: {
        validator: Number.isInteger,
        message: (props) =>
          `Class capacity must be an integer. Current value: ${props.value}`,
      },
    },

    description: {
      type: String,
      maxLength: 100,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Class", classesSchema);
