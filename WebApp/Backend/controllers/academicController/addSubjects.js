const Department = require("../../models/department");
const Subjects = require("../../models/subjects");
const logger = require("../../logger/logger");

const addSubjects = async (req, res) => {
  try {
    // 1️⃣ Normalize input: single object → array
    let subjects = req.body;
    if (!subjects) {
      logger.warn(`AddSubjects Failed | No subjects provided | IP: ${req.ip}`);
      return res.status(400).json({
        success: false,
        message: "No subjects provided",
      });
    }
    if (!Array.isArray(subjects)) subjects = [subjects];
    if (subjects.length === 0) {
      logger.warn(`AddSubjects Failed | Empty subjects array | IP: ${req.ip}`);
      return res.status(400).json({
        success: false,
        message: "No subjects provided",
      });
    }

    // 2️⃣ Map department names to IDs
    const departmentNames = subjects.map((s) => s.DepartmentName?.trim());
    const departments = await Department.find(
      { DepartmentName: { $in: departmentNames } },
      { _id: 1, DepartmentName: 1 }
    ).lean();

    const departmentMap = {};
    departments.forEach((d) => {
      departmentMap[d.DepartmentName] = d._id;
    });

    const results = [];
    const docsToInsert = [];

    // 3️⃣ Validate departments & prepare docs
    for (const subj of subjects) {
      const { SubjectCode, SubjectName, DepartmentName, Semester } = subj;
      const departmentId = departmentMap[DepartmentName?.trim()];

      if (!departmentId) {
        logger.warn(
          `AddSubjects Warning | Invalid Department: "${DepartmentName}" | SubjectCode: "${SubjectCode}" | IP: ${req.ip}`
        );
        results.push({
          SubjectCode,
          SubjectName,
          DepartmentName,
          success: false,
          message: `Department "${DepartmentName}" does not exist`,
        });
        continue;
      }

      docsToInsert.push({
        SubjectCode,
        SubjectName,
        DepartmentID: departmentId,
        Semester,
      });
    }

    // 4️⃣ Check duplicates BEFORE inserting
    const validDocs = [];
    for (const doc of docsToInsert) {
      const exists = await Subjects.findOne({
        DepartmentID: doc.DepartmentID,
        $or: [{ SubjectCode: doc.SubjectCode }, { SubjectName: doc.SubjectName }],
      }).lean();

      const departmentName = Object.entries(departmentMap).find(
        ([name, id]) => id.toString() === doc.DepartmentID.toString()
      )?.[0];

      if (exists) {
        const message =
          exists.SubjectCode === doc.SubjectCode
            ? `Subject code "${doc.SubjectCode}" already exists in department`
            : `Subject name "${doc.SubjectName}" already exists in department`;

        logger.warn(
          `AddSubjects Duplicate | ${message} | DepartmentID: ${doc.DepartmentID} | IP: ${req.ip}`
        );

        results.push({
          SubjectCode: doc.SubjectCode,
          SubjectName: doc.SubjectName,
          DepartmentName: departmentName || "Unknown",
          success: false,
          message,
        });
      } else {
        validDocs.push(doc);
      }
    }

    // 5️⃣ Insert valid subjects
    if (validDocs.length > 0) {
      // Build a reverse map for ID -> DepartmentName (avoid returning "Unknown")
      const deptIdToName = {};
      Object.entries(departmentMap).forEach(([name, id]) => {
        deptIdToName[id.toString()] = name;
      });

      // Detect duplicates INSIDE the same payload (otherwise insertMany can throw)
      const seenCode = new Set(); // key: deptId|code
      const seenName = new Set(); // key: deptId|name
      const dedupedDocs = [];

      for (const doc of validDocs) {
        const deptId = doc.DepartmentID.toString();
        const codeKey = `${deptId}|${doc.SubjectCode}`;
        const nameKey = `${deptId}|${doc.SubjectName}`;
        const departmentName = deptIdToName[deptId] || "Unknown";

        if (seenCode.has(codeKey)) {
          results.push({
            SubjectCode: doc.SubjectCode,
            SubjectName: doc.SubjectName,
            DepartmentName: departmentName,
            success: false,
            message: `Duplicate subject code "${doc.SubjectCode}" in request for this department`,
          });
          continue;
        }
        if (seenName.has(nameKey)) {
          results.push({
            SubjectCode: doc.SubjectCode,
            SubjectName: doc.SubjectName,
            DepartmentName: departmentName,
            success: false,
            message: `Duplicate subject name "${doc.SubjectName}" in request for this department`,
          });
          continue;
        }

        seenCode.add(codeKey);
        seenName.add(nameKey);
        dedupedDocs.push(doc);
      }

      if (dedupedDocs.length > 0) {
        try {
          // ordered:false allows other valid inserts to succeed
          const insertedDocs = await Subjects.insertMany(dedupedDocs, {
            ordered: false,
          });

          insertedDocs.forEach((d) => {
            const departmentName =
              deptIdToName[d.DepartmentID.toString()] || "Unknown";

            logger.info(
              `AddSubjects Success | SubjectCode: "${d.SubjectCode}" | SubjectName: "${d.SubjectName}" | DepartmentID: ${d.DepartmentID} | IP: ${req.ip}`
            );

            results.push({
              SubjectCode: d.SubjectCode,
              SubjectName: d.SubjectName,
              DepartmentName: departmentName,
              success: true,
              message: "Added successfully",
            });
          });
        } catch (err) {
          // Convert bulk duplicate errors into per-row results instead of 500
          const writeErrors = err?.writeErrors || err?.result?.writeErrors || [];

          if (Array.isArray(writeErrors) && writeErrors.length > 0) {
            writeErrors.forEach((we) => {
              const idx = we?.index;
              const doc = Number.isInteger(idx) ? dedupedDocs[idx] : null;
              if (!doc) return;

              const deptId = doc.DepartmentID.toString();
              const departmentName = deptIdToName[deptId] || "Unknown";

              results.push({
                SubjectCode: doc.SubjectCode,
                SubjectName: doc.SubjectName,
                DepartmentName: departmentName,
                success: false,
                message:
                  we?.errmsg ||
                  we?.err?.errmsg ||
                  "Duplicate key error while inserting subject",
              });
            });
          } else {
            // Unknown insert error: still return a controlled partial-failure response
            dedupedDocs.forEach((doc) => {
              const deptId = doc.DepartmentID.toString();
              const departmentName = deptIdToName[deptId] || "Unknown";
              results.push({
                SubjectCode: doc.SubjectCode,
                SubjectName: doc.SubjectName,
                DepartmentName: departmentName,
                success: false,
                message: "Failed to insert subject",
              });
            });
          }

          logger.error(
            `AddSubjects InsertMany Failed | Error: ${err.message} | IP: ${req.ip}`,
            { stack: err.stack }
          );
        }
      }
    }

    // 6️⃣ Overall status & logging
    const failedCount = results.filter((r) => !r.success).length;
    if (failedCount > 0) {
      logger.warn(
        `AddSubjects Partial Success | ${results.length - failedCount} succeeded, ${failedCount} failed | IP: ${req.ip}`
      );
    } else {
      logger.info(
        `AddSubjects All Success | ${results.length} subjects added successfully | IP: ${req.ip}`
      );
    }

    return res.status(failedCount > 0 ? 400 : 200).json({
      success: failedCount === 0,
      results: results,
      message:
        failedCount > 0
          ? "Some subjects could not be added. Please review errors."
          : "All subjects added successfully",
    });
  } catch (error) {
    logger.error(
      `AddSubjects Failed | Error: ${error.message} | IP: ${req.ip}`,
      { stack: error.stack }
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error while adding subjects",
    });
  }
};

module.exports = addSubjects;