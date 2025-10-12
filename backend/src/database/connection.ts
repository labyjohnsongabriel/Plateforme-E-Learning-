// src/database/connection.ts
import mongoose from 'mongoose';
import logger from '../utils/logger';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI: string =
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/elearning";
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
      maxPoolSize: 10, // Limit connection pool size
      retryWrites: true, // Retry failed writes
      retryReads: true, // Retry failed reads
      connectTimeoutMS: 10000, // Connection timeout
      socketTimeoutMS: 45000, // Socket timeout
    } as mongoose.ConnectOptions); // Changé de ConnectionOptions à ConnectOptions
    logger.info("MongoDB connected successfully");
  } catch (err: unknown) {
    const error = err as Error;
    logger.error(`MongoDB connection error: ${error.message}`);
    throw err; // Let caller handle the error
  }
};

// Handle connection events
mongoose.connection.on("connected", (): void => {
  logger.info("Mongoose connected to DB");
});

mongoose.connection.on("error", (err: Error): void => {
  logger.error(`Mongoose connection error: ${err.message}`);
});

mongoose.connection.on("disconnected", (): void => {
  logger.warn("Mongoose disconnected from DB");
});

process.on("SIGINT", async (): Promise<void> => {
  await mongoose.connection.close();
  logger.info("MongoDB connection closed due to app termination");
  process.exit(0);
});

export = { connectDB };