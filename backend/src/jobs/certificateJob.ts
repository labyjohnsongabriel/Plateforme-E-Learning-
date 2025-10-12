// src/jobs/certificateJob.ts (version simplifiée)
import cron from 'node-cron';
import Progression from '../models/learning/Progression';
import CertificatService from '../services/learning/CertificationService';
import logger from '../utils/logger';

// Daily job to check for completed progressions without certificates
cron.schedule('0 0 * * *', async () => {
  try {
    logger.info('🚀 Démarrage du job de vérification des certificats...');
    
    // Récupérer les progressions complétées
    const completedProgressions = await Progression.find({ 
      pourcentage: 100, 
      dateFin: { $exists: true, $ne: null } 
    })
    .populate('apprenant')
    .populate('cours');

    logger.info(`📊 ${completedProgressions.length} progressions complétées trouvées`);

    let successCount = 0;
    let errorCount = 0;

    // Traiter chaque progression
    for (const progression of completedProgressions) {
      try {
        // CORRECTION : Utilisation directe sans conversion
        const cert = await CertificatService.generateIfEligible(progression);
        if (cert) {
          successCount++;
          logger.info(`✅ Certificat généré pour l'apprenant ${progression.apprenant}`);
        }
      } catch (error) {
        errorCount++;
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        logger.error(`❌ Erreur avec progression ${progression._id}: ${errorMessage}`);
      }
    }

    logger.info(`🎯 Job terminé: ${successCount} certificats générés, ${errorCount} erreurs`);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    logger.error('💥 Erreur critique dans le job de certificats:', errorMessage);
  }
}, {
  timezone: 'Africa/Abidjan'
});

logger.info('⏰ Job de certificats programmé pour s\'exécuter quotidiennement à minuit');

export default cron;