const express = require("express");
const bodyparser = require("body-parser");
const authRoute = require("./routes/authRoute");
const DbConnection = require("./config/DbConfig");
require("dotenv").config();

const port = process.env.PORT || 3000;

const app = express();
DbConnection();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use("/api/auth/", authRoute);

app.listen(port, () => {
  console.log(`Server is up and running in ${port} `);
});
