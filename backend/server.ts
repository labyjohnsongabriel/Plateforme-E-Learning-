// backend/server.js
require("dotenv").config({ path: ".env" }); // Explicitly specify .env path
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const { connect } = require("./src/config/database");
const { init: initSocket } = require("./src/utils/socket");
const logger = require("./src/utils/logger");

// Create Express app
const app = express();
const server = http.createServer(app);

// Apply CORS middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"], // Support both frontend ports
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Middleware to parse JSON
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
app.use("/api/stats", require("./src/routes/stats"));

// Test route to verify server is running
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running correctly" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res
    .status(err.status || 500)
    .json({ message: "Server error", error: err.message });
});

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

// Function to attempt starting the server on a given port
const startServer = async (port) => {
  try {
    await connect(); // MongoDB connection
    server.listen(port, () => {
      logger.info(`🚀 Server running on port ${port}`);
    });
  } catch (err) {
    if (err.code === "EADDRINUSE") {
      logger.warn(`Port ${port} is in use, trying port ${port + 1}`);
      startServer(port + 1); // Try the next port
    } else {
      logger.error(`❌ Server startup error: ${err.message}`);
      process.exit(1);
    }
  }
};

// Start server on the specified port or default to 3000
const port = process.env.PORT || 3000;
startServer(port);

// Handle uncaught exceptions and rejections
process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});
