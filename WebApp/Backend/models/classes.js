  const mongoose = require("mongoose");

  const classesSchema = new mongoose.Schema(
    {
      Classroom: {
        type: String,
        required: true,
        unique: true,
        min: 1,
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
      Subjects: {
        type: [String],
        ref: "subjects",
      },
      Students: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Students",
      },
    },
    {
      timestamps: true,
    },
  );

  module.exports = mongoose.model("Classroom", classesSchema);
