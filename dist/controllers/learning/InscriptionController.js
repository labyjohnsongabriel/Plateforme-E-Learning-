"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const InscriptionService_1 = require("../../services/learning/InscriptionService");
/**
 * Contrôleur pour gérer les inscriptions des utilisateurs à des cours.
 */
class InscriptionController {
}
_a = InscriptionController;
/**
 * Inscrit un utilisateur à un cours.
 * @param req - Requête Express avec corps et utilisateur authentifié
 * @param res - Réponse Express
 * @param next - Fonction middleware suivante
 */
InscriptionController.enroll = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        }
        const inscription = await InscriptionService_1.InscriptionService.enroll(req.user.id, req.body.coursId);
        res.status(201).json(inscription);
    }
    catch (err) {
        console.error('Erreur controller enroll:', err.message);
        next(err);
    }
};
/**
 * Récupère toutes les inscriptions d'un utilisateur.
 * @param req - Requête Express avec utilisateur authentifié
 * @param res - Réponse Express
 * @param next - Fonction middleware suivante
 */
InscriptionController.getUserEnrollments = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        }
        const enrollments = await InscriptionService_1.InscriptionService.getUserEnrollments(req.user.id);
        res.json(enrollments);
    }
    catch (err) {
        next(err);
    }
};
/**
 * Met à jour le statut d'une inscription.
 * @param req - Requête Express avec paramètre ID et corps
 * @param res - Réponse Express
 * @param next - Fonction middleware suivante
 */
InscriptionController.updateStatus = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        }
        const inscription = await InscriptionService_1.InscriptionService.updateStatus(req.params.id, req.body.statut, req.user.id);
        res.json(inscription);
    }
    catch (err) {
        next(err);
    }
};
/**
 * Supprime une inscription.
 * @param req - Requête Express avec paramètre ID
 * @param res - Réponse Express
 * @param next - Fonction middleware suivante
 */
InscriptionController.delete = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        }
        const result = await InscriptionService_1.InscriptionService.deleteEnrollment(req.params.id, req.user.id);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
};
exports.default = InscriptionController;
//# sourceMappingURL=InscriptionController.js.map