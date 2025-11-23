const express = require("express");
const bodyparser = require("body-parser");
const authRoute = require("./routes/authRoute");
const userRouer = require("./routes/usersRoutes");
const DbConnection = require("./config/DbConfig");
require("dotenv").config();
const cors = require("cors");

const port = process.env.PORT || 5500;

const app = express();
DbConnection();

// 🚨 FIX: MOVE CORS MIDDLEWARE UP HERE 🚨
app.use(
  cors({
    origin: "http://localhost:5173", // your React app origin
    credentials: true, // allow cookies if needed
  })
);
// -------------------------------------

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

// Routes are defined after CORS middleware
app.use("/api/auth/", authRoute);
app.use("/api/users", userRouer);

app.listen(port, () => {
  console.log(`Server is up and running at http://localhost:${port}/ `);
});
