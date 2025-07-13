const express = require("express");
const cors = require("cors");
const path = require("path");
const userRoutes = require("./routes/userRoutes.js")
const messageRoutes = require("./routes/messageRoutes.js");
const upload = require("./routes/upload.js");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Test route
app.get("/", (req, res) => {
  res.send("Qthanh1t's Chat App!!");
});

app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", upload);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

module.exports = app;
