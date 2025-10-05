"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/jobs/certificateJob.ts
const node_cron_1 = __importDefault(require("node-cron"));
const Progression_1 = __importDefault(require("../models/learning/Progression")); // Changé en importation par défaut
const CertificationService = __importStar(require("../services/learning/CertificationService"));
const logger_1 = __importDefault(require("../utils/logger"));
// Daily job to check for completed progressions without certificates
node_cron_1.default.schedule('0 0 * * *', async () => {
    try {
        const completed = await Progression_1.default.find({
            pourcentage: 100,
            dateFin: { $exists: true }
        });
        for (const prog of completed) {
            await CertificationService.generateIfEligible(prog);
        }
        logger_1.default.info('Certificate job completed');
    }
    catch (err) {
        const error = err;
        logger_1.default.error(`Certificate job error: ${error.message}`);
    }
}, {
    timezone: 'Africa/Abidjan' // Adjust to relevant timezone
});
//# sourceMappingURL=certificateJob.js.map