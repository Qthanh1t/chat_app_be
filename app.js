const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes.js")
const messageRoutes = require("./routes/messageRoutes.js");
const upload = require("./routes/upload.js");
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
app.use("/api/upload", upload);

app.use("/uploads", express.static("uploads"));
module.exports = app;
