// src/database/connection.ts
import mongoose from 'mongoose';
import logger from '../utils/logger';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI: string =
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/elearning";
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, 
      maxPoolSize: 10, 
      retryWrites: true, 
      retryReads: true, 
      connectTimeoutMS: 10000,x
      socketTimeoutMS: 45000,
    } as mongoose.ConnectOptions); 
    logger.info("MongoDB connected successfully");
  } catch (err: unknown) {
    const error = err as Error;
    logger.error(`MongoDB connection error: ${error.message}`);
    throw err;
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