const mongoose = require("mongoose");

const studentEmbeddingSchema = new mongoose.Schema(
  {
    StudentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "students",
      required: true,
      unique: true, // One embedding per student
    },

    RollNo: {
      type: Number,
      required: true,
      unique: true,
    },

    Embedding: {
      type: [Number], // Array of numbers for the embedding vector
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length === 512; // Assuming 512-dimensional embedding
        },
        message: "Embedding must be a 512-dimensional vector",
      },
    },

    EmbeddingMetadata: {
      ImagesProcessed: {
        type: Number,
        required: true,
        min: 1,
      },
      ImagesFailed: {
        type: Number,
        default: 0,
      },
      EnrollmentDate: {
        type: Date,
        default: Date.now,
      },
    },

    LastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes are already created via unique: true in schema definition

module.exports = mongoose.model("studentEmbedding", studentEmbeddingSchema);