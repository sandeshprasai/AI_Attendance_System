const classSchema = require("../../models/classes");
const logger = require("../../logger/logger");

const addMultipleClasses = async (req, res) => {
  try {
    // 1️⃣ Normalize input: single object → array
    let classes = req.body.classes || req.body;
    
    logger.info(`Add Classes process started | IP: ${req.ip}`);

    if (!classes) {
      logger.warn(`Add Classes Failed | No classes provided | IP: ${req.ip}`);
      return res.status(400).json({
        success: false,
        message: "No classes provided",
      });
    }

    if (!Array.isArray(classes)) classes = [classes];
    
    if (classes.length === 0) {
      logger.warn(`Add Classes Failed | Empty classes array | IP: ${req.ip}`);
      return res.status(400).json({
        success: false,
        message: "Classes array is required",
      });
    }

    const results = [];
    const docsToInsert = [];

    // 2️⃣ Validate and prepare documents
    for (const classItem of classes) {
      const { Class, Capacity, Description } = classItem;
      const classroomCode = Class?.trim();

      // Basic validation
      if (!classroomCode) {
        results.push({
          Classroom: classroomCode || "",
          Capacity: Capacity || "",
          success: false,
          message: "Classroom code is required",
        });
        continue;
      }

      if (!Capacity || isNaN(Number(Capacity)) || Number(Capacity) <= 0) {
        results.push({
          Classroom: classroomCode,
          Capacity: Capacity || "",
          success: false,
          message: "Valid capacity is required (must be a positive number)",
        });
        continue;
      }

      docsToInsert.push({
        Classroom: classroomCode,
        capacity: Number(Capacity),
        description: Description?.trim() || "",
        _originalData: classItem, // Keep reference for error reporting
      });
    }

    // 3️⃣ Check for duplicates BEFORE inserting
    const validDocs = [];
    for (const doc of docsToInsert) {
      const exists = await classSchema.findOne({
        Classroom: doc.Classroom,
      }).lean();

      if (exists) {
        logger.warn(
          `Add Classes Duplicate | Classroom "${doc.Classroom}" already exists | IP: ${req.ip}`
        );

        results.push({
          Classroom: doc.Classroom,
          Capacity: doc.capacity,
          success: false,
          message: `Classroom "${doc.Classroom}" already exists`,
        });
      } else {
        validDocs.push(doc);
      }
    }

    // 4️⃣ Detect duplicates INSIDE the same payload
    const seenClassrooms = new Set();
    const dedupedDocs = [];

    for (const doc of validDocs) {
      const classroomKey = doc.Classroom.toLowerCase();

      if (seenClassrooms.has(classroomKey)) {
        results.push({
          Classroom: doc.Classroom,
          Capacity: doc.capacity,
          success: false,
          message: `Duplicate classroom "${doc.Classroom}" in request`,
        });
        continue;
      }

      seenClassrooms.add(classroomKey);
      dedupedDocs.push(doc);
    }

    // 5️⃣ Insert valid classrooms
    if (dedupedDocs.length > 0) {
      try {
        // ordered:false allows other valid inserts to succeed
        const insertedDocs = await classSchema.insertMany(dedupedDocs, {
          ordered: false,
        });

        insertedDocs.forEach((d) => {
          logger.info(
            `Add Classes Success | Classroom: "${d.Classroom}" | Capacity: ${d.capacity} | IP: ${req.ip}`
          );

          results.push({
            Classroom: d.Classroom,
            Capacity: d.capacity,
            success: true,
            message: "Added successfully",
          });
        });
      } catch (err) {
        // Convert bulk duplicate errors into per-row results
        const writeErrors = err?.writeErrors || err?.result?.writeErrors || [];

        if (Array.isArray(writeErrors) && writeErrors.length > 0) {
          writeErrors.forEach((we) => {
            const idx = we?.index;
            const doc = Number.isInteger(idx) ? dedupedDocs[idx] : null;
            if (!doc) return;

            const errorMsg = we?.errmsg || we?.err?.errmsg || "";
            let message = "Failed to add classroom";

            // Parse duplicate key error
            if (errorMsg.includes("duplicate key") || err.code === 11000) {
              message = `Classroom "${doc.Classroom}" already exists (duplicate key error)`;
            }

            logger.warn(
              `Add Classes Insert Error | Classroom: "${doc.Classroom}" | Error: ${errorMsg} | IP: ${req.ip}`
            );

            results.push({
              Classroom: doc.Classroom,
              Capacity: doc.capacity,
              success: false,
              message,
            });
          });

          // Handle any successfully inserted docs despite errors
          const insertedDocs = err?.insertedDocs || [];
          insertedDocs.forEach((d) => {
            logger.info(
              `Add Classes Partial Success | Classroom: "${d.Classroom}" | Capacity: ${d.capacity} | IP: ${req.ip}`
            );

            results.push({
              Classroom: d.Classroom,
              Capacity: d.capacity,
              success: true,
              message: "Added successfully",
            });
          });
        } else {
          // Unknown insert error: still return a controlled partial-failure response
          dedupedDocs.forEach((doc) => {
            results.push({
              Classroom: doc.Classroom,
              Capacity: doc.capacity,
              success: false,
              message: "Failed to insert classroom",
            });
          });
        }

        logger.error(
          `Add Classes InsertMany Failed | Error: ${err.message} | IP: ${req.ip}`,
          { stack: err.stack }
        );
      }
    }

    // 6️⃣ Overall status & logging
    const failedCount = results.filter((r) => !r.success).length;
    const successCount = results.length - failedCount;

    if (failedCount > 0) {
      logger.warn(
        `Add Classes Partial Success | ${successCount} succeeded, ${failedCount} failed | IP: ${req.ip}`
      );
    } else {
      logger.info(
        `Add Classes All Success | ${results.length} classrooms added successfully | IP: ${req.ip}`
      );
    }

    return res.status(failedCount > 0 ? 400 : 200).json({
      success: failedCount === 0,
      results: results,
    });

  } catch (error) {
    logger.error(
      `Add Classes Fatal Error | IP: ${req.ip} | Error: ${error.message}`,
      { stack: error.stack }
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error while adding classrooms",
    });
  }
};

module.exports = addMultipleClasses;
