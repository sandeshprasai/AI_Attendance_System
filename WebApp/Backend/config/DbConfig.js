const mongoose = require("mongoose");
require("dotenv").config({path:"../../.env"});

async function DataBaseConnection() {
  try {
    await  mongoose.connect(process.env.MONGO_URI);
    console.log("Database Connected Successfully");
  } catch (error) {
    console.error(`Error connecting to MongoDb database ${error}`);
  }
}


module.exports = DataBaseConnection