const express = require("express");
const DbConnection = require("./config/DbConfig");
require("dotenv").config();

const port = process.env.PORT || 3000;

const app = express();
DbConnection();

app.listen(port, () => {
  console.log(`Server is up and running in ${port} `);
});
