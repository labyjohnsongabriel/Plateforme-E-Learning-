import mongoose from 'mongoose';
import logger from '../utils/logger';
import config from './config';

export const connectDB = async (): Promise<void> => {
  const mongoURI = config.MONGO_URI;

  if (!mongoURI) {
    logger.error('❌ MONGODB_URI non définie dans les variables d’environnement');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoURI, { retryWrites: true, w: 'majority' });
    logger.info(`✅ MongoDB connecté: ${conn.connection.host}`);
  } catch (error: any) {
    logger.error(`❌ Erreur de connexion MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
