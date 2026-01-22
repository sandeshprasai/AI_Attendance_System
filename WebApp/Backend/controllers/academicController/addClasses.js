const classSchema = require("../../models/classes");
const logger = require("../../logger/logger");

const addMultipleClasses = async (req, res) => {
  const { classes } = req.body;

  logger.info(`Add Classes process started | IP: ${req.ip}`);

  // Empty classes array
  if (!Array.isArray(classes) || classes.length === 0) {
    logger.warn(`Empty classes fields | IP: ${req.ip}`);

    return res.status(400).json({
      success: false,
      message: "Classes array is required",
      data: [],
    });
  }

  const payload = classes.map(item => ({
    Classroom: item.Class,
    capacity: item.Capacity,
    description: item.Description,
  }));

  try {
    const createdClasses = await classSchema.insertMany(payload, {
      ordered: false,
    });

    

    logger.info(
      `Classes Created Successfully | Count: ${createdClasses.length} | IP: ${req.ip}`
    );

    return res.status(201).json({
      success: true,
      message: "Classes Created Successfully",
      data: {
        createdCount: createdClasses.length,
        created: createdClasses,
      },
    });

  } catch (error) {
    // Duplicate classes
    if (error.code === 11000) {
      const insertedDocs = error.insertedDocs || [];

      const duplicateClasses = error.writeErrors.map(
        err => err.err.op.class
      );

      logger.warn(
        `Duplicate Classes skipped while adding classes | IP: ${req.ip}`,
        {
          duplicates: duplicateClasses,
        }
      );



      
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

    logger.error(
      `Failed to add classes | IP: ${req.ip} | Error: ${error.message}`
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: [],
    });
  }
};

module.exports = addMultipleClasses;
