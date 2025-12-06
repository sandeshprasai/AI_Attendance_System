const express = require("express");
const bodyparser = require("body-parser");
const authRoute = require("./routes/authRoute");
const userRouter = require("./routes/usersRoutes");
const DbConnection = require("./config/DbConfig");
const logger = require("./logger/logger");
const morganMiddleware = require("./logger/morgan");
const requstID = require("./middlewares/requestID");
require("dotenv").config();
const cors = require("cors");

const port = process.env.PORT || 5500;

const app = express();
DbConnection();

app.use(requstID);
app.use(morganMiddleware);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://ai-attendance-system-three.vercel.app/",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const path = require("path");
app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/api/v1/auth/", authRoute);
app.use("/api/v1/users", userRouter);

app.listen(port, () => {
  console.log(`Server is up and running at http://localhost:${port}/ `);
});
