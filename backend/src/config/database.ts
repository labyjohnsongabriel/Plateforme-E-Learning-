import mongoose from 'mongoose';
import { connectDB } from '../database/connection'; // Ajustez le chemin si nécessaire
import logger from '../utils/logger'; // Assurez-vous que ce fichier existe et est typé

interface DatabaseConfig {
  connect: () => Promise<void>;
}

const config: DatabaseConfig = {
  connect: async () => {
    try {
      await connectDB();
      logger.info('MongoDB connected via config/database.ts');
    } catch (err) {
      logger.error(`DB connection error: ${(err as Error).message}`);
      process.exit(1);
    }
  },
};

export default config;
