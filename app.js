const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes.js")
const messageRoutes = require("./routes/messageRoutes.js");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Test route
app.get("/", (req, res) => {
  res.send("Hello from Flutter Chat Backend!");
});

app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

module.exports = app;
