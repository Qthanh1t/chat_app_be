const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes.js")

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Test route
app.get("/", (req, res) => {
  res.send("Hello from Flutter Chat Backend!");
});

app.use("/api/users", userRoutes);


module.exports = app;
