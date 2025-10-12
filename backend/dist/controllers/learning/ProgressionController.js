"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const ProgressionService_1 = __importDefault(require("../../services/learning/ProgressionService"));
const CertificationService_1 = __importDefault(require("../../services/learning/CertificationService")); // Import de la classe
const socket_1 = require("../../utils/socket");
/**
 * Contrôleur pour gérer la progression des utilisateurs dans les cours.
 */
class ProgressionController {
}
_a = ProgressionController;
/**
 * Récupère la progression d'un utilisateur pour un cours spécifique.
 */
ProgressionController.getByUserAndCourse = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        }
        const progression = await ProgressionService_1.default.getByUserAndCourse(req.user.id, req.params.coursId);
        res.json(progression || { pourcentage: 0 }); // Retourne 0 si pas de progression
    }
    catch (err) {
        next(err);
    }
};
/**
 * Met à jour la progression d'un utilisateur et génère un certificat si nécessaire.
 */
ProgressionController.update = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        }
        const progression = await ProgressionService_1.default.update(req.user.id, req.params.coursId, req.body.pourcentage);
        // Si progression complète, générer certificat
        if (progression.pourcentage === 100) {
            // CORRECTION : Utilisation de la méthode statique de la classe
            const cert = await CertificationService_1.default.generateIfEligible(progression);
            if (cert) {
                // Notification temps réel
                const io = (0, socket_1.getIO)();
                io.to(progression.apprenant.toString()).emit('new_certificate', cert);
                io.emit('progress_update', { userId: progression.apprenant, coursId: progression.cours });
            }
        }
        res.json(progression);
    }
    catch (err) {
        console.error('Erreur controller update progression:', err.message);
        next(err);
    }
};
exports.default = ProgressionController;
//# sourceMappingURL=ProgressionController.js.map