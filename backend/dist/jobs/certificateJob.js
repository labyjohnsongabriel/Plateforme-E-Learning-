"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/jobs/certificateJob.ts (version simplifiée)
const node_cron_1 = __importDefault(require("node-cron"));
const Progression_1 = __importDefault(require("../models/learning/Progression"));
const CertificationService_1 = __importDefault(require("../services/learning/CertificationService"));
const logger_1 = __importDefault(require("../utils/logger"));
// Daily job to check for completed progressions without certificates
node_cron_1.default.schedule('0 0 * * *', async () => {
    try {
        logger_1.default.info('🚀 Démarrage du job de vérification des certificats...');
        // Récupérer les progressions complétées
        const completedProgressions = await Progression_1.default.find({
            pourcentage: 100,
            dateFin: { $exists: true, $ne: null }
        })
            .populate('apprenant')
            .populate('cours');
        logger_1.default.info(`📊 ${completedProgressions.length} progressions complétées trouvées`);
        let successCount = 0;
        let errorCount = 0;
        // Traiter chaque progression
        for (const progression of completedProgressions) {
            try {
                // CORRECTION : Utilisation directe sans conversion
                const cert = await CertificationService_1.default.generateIfEligible(progression);
                if (cert) {
                    successCount++;
                    logger_1.default.info(`✅ Certificat généré pour l'apprenant ${progression.apprenant}`);
                }
            }
            catch (error) {
                errorCount++;
                const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
                logger_1.default.error(`❌ Erreur avec progression ${progression._id}: ${errorMessage}`);
            }
        }
        logger_1.default.info(`🎯 Job terminé: ${successCount} certificats générés, ${errorCount} erreurs`);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        logger_1.default.error('💥 Erreur critique dans le job de certificats:', errorMessage);
    }
}, {
    timezone: 'Africa/Abidjan'
});
logger_1.default.info('⏰ Job de certificats programmé pour s\'exécuter quotidiennement à minuit');
exports.default = node_cron_1.default;
//# sourceMappingURL=certificateJob.js.map