"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cron = require('node-cron');
const Progression = require('../models/learning/Progression');
const CertificationService = require('../services/learning/CertificationService');
const logger = require('../utils/logger');
// Daily job to check for completed progressions without certificates
cron.schedule('0 0 * * *', async () => {
    try {
        const completed = await Progression.find({ pourcentage: 100, dateFin: { $exists: true } });
        for (const prog of completed) {
            await CertificationService.generateIfEligible(prog);
        }
        logger.info('Certificate job completed');
    }
    catch (err) {
        logger.error(`Certificate job error: ${err.message}`);
    }
}, {
    timezone: 'Africa/Abidjan' // Adjust to relevant timezone
});
//# sourceMappingURL=certificateJob.js.map