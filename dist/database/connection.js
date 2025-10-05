"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
// src/database/connection.ts
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/elearning";
        await mongoose_1.default.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s
            maxPoolSize: 10, // Limit connection pool size
            retryWrites: true, // Retry failed writes
            retryReads: true, // Retry failed reads
            connectTimeoutMS: 10000, // Connection timeout
            socketTimeoutMS: 45000, // Socket timeout
        }); // Changé de ConnectionOptions à ConnectOptions
        logger_1.default.info("MongoDB connected successfully");
    }
    catch (err) {
        const error = err;
        logger_1.default.error(`MongoDB connection error: ${error.message}`);
        throw err; // Let caller handle the error
    }
};
// Handle connection events
mongoose_1.default.connection.on("connected", () => {
    logger_1.default.info("Mongoose connected to DB");
});
mongoose_1.default.connection.on("error", (err) => {
    logger_1.default.error(`Mongoose connection error: ${err.message}`);
});
mongoose_1.default.connection.on("disconnected", () => {
    logger_1.default.warn("Mongoose disconnected from DB");
});
process.on("SIGINT", async () => {
    await mongoose_1.default.connection.close();
    logger_1.default.info("MongoDB connection closed due to app termination");
    process.exit(0);
});
module.exports = { connectDB };
//# sourceMappingURL=connection.js.map