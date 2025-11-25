const express = require("express");
const bodyparser = require("body-parser");
const authRoute = require("./routes/authRoute");
const userRouter = require("./routes/usersRoutes");
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes are defined after CORS middleware
app.use("/api/v1/auth/", authRoute);
app.use("/api/v1/users", userRouter);


app.listen(port, () => {
  console.log(`Server is up and running at http://localhost:${port}/ `);
});
