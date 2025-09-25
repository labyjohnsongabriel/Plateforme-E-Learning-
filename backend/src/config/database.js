// src/config/database.js
const mongoose = require("mongoose");
const { connectDB } = require("../database/connection"); // Correct import
const logger = require("../utils/logger"); // Assuming logger exists

module.exports = {
  connect: async () => {
    try {
      await connectDB(); // Call connectDB from connection.js
      logger.info("MongoDB connected via config/database.js");
    } catch (err) {
      logger.error(`DB connection error: ${err.message}`);
      process.exit(1);
    }
  },
};
