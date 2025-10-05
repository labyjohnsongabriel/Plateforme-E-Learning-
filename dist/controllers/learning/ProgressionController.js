"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const ProgressionService_1 = require("../../services/learning/ProgressionService");
const CertificationService_1 = require("../../services/learning/CertificationService");
const socket_1 = require("../../utils/socket");
/**
 * Contrôleur pour gérer la progression des utilisateurs dans les cours.
 */
class ProgressionController {
}
_a = ProgressionController;
/**
 * Récupère la progression d'un utilisateur pour un cours spécifique.
 * @param req - Requête Express avec paramètre coursId et utilisateur authentifié
 * @param res - Réponse Express
 * @param next - Fonction middleware suivante
 */
ProgressionController.getByUserAndCourse = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        }
        const progression = await ProgressionService_1.ProgressionService.getByUserAndCourse(req.user.id, req.params.coursId);
        res.json(progression || { pourcentage: 0 }); // Retourne 0 si pas de progression
    }
    catch (err) {
        next(err);
    }
};
/**
 * Met à jour la progression d'un utilisateur dans un cours et génère un certificat si nécessaire.
 * @param req - Requête Express avec paramètre coursId, corps (pourcentage), et utilisateur authentifié
 * @param res - Réponse Express
 * @param next - Fonction middleware suivante
 */
ProgressionController.update = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        }
        const progression = await ProgressionService_1.ProgressionService.update(req.user.id, req.params.coursId, req.body.pourcentage);
        if (progression.pourcentage === 100) {
            const cert = await CertificationService_1.CertificatService.generateIfEligible(progression);
            if (cert) {
                // Notification real-time à l'utilisateur
                const io = (0, socket_1.getIo)();
                io.to(progression.apprenant.toString()).emit('new_certificate', cert);
                // Optionnel : Emit à admin pour tableau de bord
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