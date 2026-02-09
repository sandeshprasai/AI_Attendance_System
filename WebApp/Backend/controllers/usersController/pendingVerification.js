const students = require("../../models/students");
const embedding = require("../../models/studentEmbedding");

const logger = require("../../logger/logger");

const pendingEmbeddingVerifcation = async (req, res) => {
  try {
    logger.info(`Get remaining embedding verification requested $ {req.ip} `);
    const totalStuddents = await students.countDocuments({});
    const totalEmbedings = await embedding.countDocuments({});
    const remeningVerification = totalStuddents - totalEmbedings;
    logger.info(
      `Fetched total  ${remeningVerification}  remaining embedding verification `,
    );
    return res.status(200).json({
      message: "Total remaining verification:",
      data: remeningVerification,
    });
  } catch (error) {
    console.log(`Error while fetching pending embedding verification `);
    logger.error(
      `Error while fetching pending embedding verificatio ${req.ip} `,
    );
    return res.status(500).json({
      message:
        "Internal server error while fetching total embedding verification ",
      data: [],
    });
  }
};

module.exports = pendingEmbeddingVerifcation;
