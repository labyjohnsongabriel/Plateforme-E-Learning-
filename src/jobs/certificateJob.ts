// src/jobs/certificateJob.ts
import cron from 'node-cron';
import Progression from '../models/learning/Progression'; // Changé en importation par défaut
import * as CertificationService from '../services/learning/CertificationService';
import logger from '../utils/logger';

interface ProgressionDocument {
  pourcentage: number;
  dateFin?: Date;
  [key: string]: any; // Pour les autres champs du modèle Progression
}

// Daily job to check for completed progressions without certificates
cron.schedule('0 0 * * *', async () => {
  try {
    const completed: ProgressionDocument[] = await Progression.find({ 
      pourcentage: 100, 
      dateFin: { $exists: true } 
    });
    for (const prog of completed) {
      await CertificationService.generateIfEligible(prog);
    }
    logger.info('Certificate job completed');
  } catch (err: unknown) {
    const error = err as Error;
    logger.error(`Certificate job error: ${error.message}`);
  }
}, {
  timezone: 'Africa/Abidjan' // Adjust to relevant timezone
});