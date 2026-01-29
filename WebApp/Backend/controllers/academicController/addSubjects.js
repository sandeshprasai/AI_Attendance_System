const Department = require("../../models/department");
const Subjects = require("../../models/subjects");
const logger = require("../../logger/logger");

const addSubjects = async (req, res) => {
  try {
    // 1️⃣ Normalize input
    let subjects = req.body;
    if (!Array.isArray(subjects)) subjects = [subjects];

    // 2️⃣ Fetch departments
    const departmentNames = subjects.map(s => s.DepartmentName?.trim());
    const departments = await Department.find(
      { DepartmentName: { $in: departmentNames } },
      { _id: 1, DepartmentName: 1 }
    ).lean();

    const departmentMap = {};
    const deptIdToName = {};

    departments.forEach(d => {
      departmentMap[d.DepartmentName] = d._id;
      deptIdToName[d._id.toString()] = d.DepartmentName;
    });

    const results = [];
    const docsToInsert = [];

    // 3️⃣ Validate departments
    for (const subj of subjects) {
      const { SubjectCode, SubjectName, DepartmentName, Semester } = subj;
      const departmentId = departmentMap[DepartmentName?.trim()];

      if (!departmentId) {
        results.push({
          SubjectCode,
          SubjectName,
          DepartmentName,
          success: false,
          reason: `Department "${DepartmentName}" doesn't exist`,
        });
        continue;
      }

      docsToInsert.push({
        SubjectCode,
        SubjectName,
        DepartmentID: departmentId, // ✅ FIXED
        Semester,
      });
    }

    // 4️⃣ Check duplicates
    const validDocs = [];
    for (const doc of docsToInsert) {
      const exists = await Subjects.findOne({
        DepartmentID: doc.DepartmentID,
        $or: [
          { SubjectCode: doc.SubjectCode },
          { SubjectName: doc.SubjectName },
        ],
      }).lean();

      if (exists) {
        results.push({
          SubjectCode: doc.SubjectCode,
          SubjectName: doc.SubjectName,
          DepartmentName: deptIdToName[doc.DepartmentID.toString()],
          success: false,
          reason: "Duplicate subject in department",
        });
      } else {
        validDocs.push(doc);
      }
    }

    // 5️⃣ Insert
    if (validDocs.length > 0) {
      const inserted = await Subjects.insertMany(validDocs, { ordered: false });

      inserted.forEach(d => {
        results.push({
          SubjectCode: d.SubjectCode,
          SubjectName: d.SubjectName,
          DepartmentName: deptIdToName[d.DepartmentID.toString()],
          success: true,
          reason: "Inserted",
        });
      });
    }

    // 6️⃣ Summary
    const summary = {
      total: subjects.length,
      inserted: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    };

    // 7️⃣ Logging
    if (summary.inserted === 0) {
      logger.warn(`AddSubjects completed | No subjects inserted | IP: ${req.ip}`);
    } else if (summary.failed > 0) {
      logger.warn(
        `AddSubjects Partial Success | ${summary.inserted} inserted, ${summary.failed} failed | IP: ${req.ip}`
      );
    } else {
      logger.info(
        `AddSubjects Success | ${summary.inserted} inserted | IP: ${req.ip}`
      );
    }

    // 8️⃣ Response
    return res.status(200).json({
      success: summary.inserted > 0,
      summary,
      results,
      message:
        summary.inserted === 0
          ? "No subjects were added"
          : summary.failed > 0
          ? "Some subjects were added, some failed"
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
