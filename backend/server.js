// backend/server.js
require("dotenv").config();
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const { connect } = require("./src/config/database");
const { init: initSocket } = require("./src/utils/socket");
const logger = require("./src/utils/logger");

// Create Express app
const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());

// Routes
app.use("/api/courses", require("./src/routes/courses"));
app.use("/api/notifications", require("./src/routes/notifications"));
app.use("/api/apprenant", require("./src/routes/apprenant"));
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/users", require("./src/routes/users"));
app.use("/api/instructeurs", require("./src/routes/instructeur"));
app.use("/api/admin", require("./src/routes/admin"));
app.use("/api/learning", require("./src/routes/learning"));
app.use("/api/index", require("./src/routes/index"));

// Initialize Socket.IO
const io = initSocket(server);

io.on("connection", (socket) => {
  logger.info(`User connected: ${socket.id}`);
  socket.on("join", (userId) => {
    socket.join(userId);
    logger.info(`User ${userId} joined room`);
  });
  socket.on("disconnect", () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Start scheduled jobs
require("./src/jobs/certificateJob");
require("./src/jobs/notificationJob");
require("./src/jobs/cleanupJob");

// Start server after DB connection
const startServer = async () => {
  try {
    await connect(); // MongoDB connection
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
      logger.info(`🚀 Server running on port ${port}`);
    });
  } catch (err) {
    logger.error(`❌ Server startup error: ${err.message}`);
  }
};

startServer();
