// -----------------------------------------------------Required Packages Imoort-----------------------------------------------------

const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

// -----------------------------------------------------Required Packages Import Completed-----------------------------------------------------

// -----------------------------------------------------Middleware Import-----------------------------------------------------

const logger = require("./logger/logger");
const morganMiddleware = require("./logger/morgan");
const requstID = require("./middlewares/requestID");

// -----------------------------------------------------Middleware import Completed-----------------------------------------------------

// -----------------------------------------------------DataBase Configuration-----------------------------------------------------

const DbConnection = require("./config/DbConfig");

// -----------------------------------------------------DataBase Configuration Completed-----------------------------------------------------

// -----------------------------------------------------Routes import-----------------------------------------------------

const authRoute = require("./routes/authRoute");
const userRouter = require("./routes/usersRoutes");
const academicRoutes = require("./routes/academicRoutes");

// -----------------------------------------------------Routes Import Completed-----------------------------------------------------

const port = process.env.PORT || 5500;
const app = express();
DbConnection();

app.use(requstID);
app.use(morganMiddleware);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://ai-attendance-system-three.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/api/v1/auth/", authRoute);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/academics", academicRoutes)

app.listen(port, () => {
  console.log(`Server is up and running at http://localhost:${port}/ `);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server error",
  });
});