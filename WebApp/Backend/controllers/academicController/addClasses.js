const classSchema = require("../../models/classes");
const logger = require("../../logger/logger");

const addMultipleClasses = async (req, res) => {
  const { classes } = req.body;

  logger.info(`Bulk create class request from ${req.ip}`);

  if (!Array.isArray(classes) || classes.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Classes array is required",
      data: [],
    });
  }

  const payload = classes.map(item => ({
    class: item.Class,
    capacity: item.Capacity,
    description: item.Description,
  }));

  try {
    const createdClasses = await classSchema.insertMany(payload, {
      ordered: false, // 🔑 KEY FIX
    });

    return res.status(201).json({
      success: true,
      message: "Classes created successfully",
      data: {
        createdCount: createdClasses.length,
        created: createdClasses,
      },
    });

  } catch (error) {
    // 🔹 HANDLE DUPLICATE KEY ERROR
    if (error.code === 11000) {
      const insertedDocs = error.insertedDocs || [];

      const duplicateClasses = error.writeErrors.map(
        err => err.err.op.class
      );

      logger.warn(`Duplicate classes skipped`, {
        duplicates: duplicateClasses,
      });

      return res.status(207).json({
        success: true,
        message: "Some classes already existed and were skipped",
        data: {
          createdCount: insertedDocs.length,
          skippedCount: duplicateClasses.length,
          skipped: duplicateClasses,
          created: insertedDocs,
        },
      });
    }

    // 🔴 UNEXPECTED ERROR
    logger.error(`Failed to create classes from ${req.ip}`, {
      error: error.message,
    });

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: [],
    });
  }
};

module.exports = addMultipleClasses;
