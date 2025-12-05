const mongoose = require("mongoose");
const logger = require("./../logger/logger");
require("dotenv").config({ path: "../../.env" });

async function DataBaseConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database Connected Successfully");
    logger.info(" Database Connected Successfully");
  } catch (error) {
    console.error(`Error connecting to MongoDb database ${error}`);
    logger.error("Database Connection Error: " + err.message);
  }
}

module.exports = DataBaseConnection;
