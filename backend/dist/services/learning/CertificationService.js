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
exports.CertificatService = exports.NiveauFormation = void 0;
const Certificat_1 = __importDefault(require("../../models/learning/Certificat"));
const Cours_1 = __importDefault(require("../../models/course/Cours"));
const NotificationService = __importStar(require("../notification/NotificationService"));
const pdfGenerator = __importStar(require("../../utils/pdfGenerator"));
const logger_1 = __importDefault(require("../../utils/logger"));
var NiveauFormation;
(function (NiveauFormation) {
    NiveauFormation["ALFA"] = "ALFA";
    NiveauFormation["BETA"] = "BETA";
    NiveauFormation["GAMMA"] = "GAMMA";
    NiveauFormation["DELTA"] = "DELTA";
})(NiveauFormation || (exports.NiveauFormation = NiveauFormation = {}));
class CertificatService {
    static async generateIfEligible(progression) {
        try {
            if (progression.pourcentage !== 100 || !progression.dateFin) {
                logger_1.default.info(`Progression non éligible pour certificat: apprenant=${progression.apprenant}, cours=${progression.cours}`);
                return null;
            }
            const existingCert = await Certificat_1.default.findOne({
                apprenant: progression.apprenant,
                cours: progression.cours,
            });
            if (existingCert) {
                logger_1.default.info(`Certificat déjà existant pour apprenant=${progression.apprenant}, cours=${progression.cours}`);
                return existingCert;
            }
            const cours = await Cours_1.default.findById(progression.cours);
            if (!cours || !Object.values(NiveauFormation).includes(cours.niveau)) {
                logger_1.default.info(`Cours non trouvé ou niveau invalide: cours=${progression.cours}, niveau=${cours?.niveau}`);
                return null;
            }
            const apprenantId = progression.apprenant.toString();
            const url = await pdfGenerator.generateCertificate(apprenantId, cours);
            const cert = new Certificat_1.default({
                apprenant: progression.apprenant,
                cours: progression.cours,
                urlCertificat: url,
                dateEmission: new Date(),
            });
            await cert.save();
            await NotificationService.create({
                utilisateur: apprenantId,
                message: `Certificat pour ${cours.titre} émis !`,
                type: 'nouveau_certificat',
            });
            logger_1.default.info(`Certificat généré pour apprenant=${progression.apprenant}, cours=${progression.cours}`);
            return cert;
        }
        catch (err) {
            const error = err;
            logger_1.default.error(`Erreur lors de la génération du certificat: ${error.message}`);
            throw error;
        }
    }
}
exports.CertificatService = CertificatService;
exports.default = CertificatService;
//# sourceMappingURL=CertificationService.js.map