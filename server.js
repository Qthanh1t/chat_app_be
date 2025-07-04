const app = require("./app");
const mongoose = require("mongoose");
require("dotenv").config();
const socketServer = require("./socket");

const PORT = process.env.PORT;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });

    socketServer(server);
  })
  .catch((err) => console.error("❌ MongoDB connection failed", err));
