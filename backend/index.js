const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from the backend server!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/`);
});