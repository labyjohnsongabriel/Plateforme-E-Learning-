"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const NotificationService_1 = require("../../services/notification/NotificationService");
/**
 * Contrôleur pour gérer les notifications des utilisateurs.
 */
class NotificationController {
}
_a = NotificationController;
/**
 * Récupère toutes les notifications d'un utilisateur authentifié.
 * @param req - Requête Express avec utilisateur authentifié
 * @param res - Réponse Express
 * @param next - Fonction middleware suivante
 */
NotificationController.getForUser = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        }
        const notifications = await NotificationService_1.NotificationService.getForUser(req.user.id);
        res.json(notifications);
    }
    catch (err) {
        next(err);
    }
};
/**
 * Marque une notification comme lue.
 * @param req - Requête Express avec paramètre ID et utilisateur authentifié
 * @param res - Réponse Express
 * @param next - Fonction middleware suivante
 */
NotificationController.markAsRead = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        }
        const notification = await NotificationService_1.NotificationService.markAsRead(req.params.id, req.user.id);
        res.json(notification);
    }
    catch (err) {
        next(err);
    }
};
/**
 * Supprime une notification.
 * @param req - Requête Express avec paramètre ID et utilisateur authentifié
 * @param res - Réponse Express
 * @param next - Fonction middleware suivante
 */
NotificationController.delete = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        }
        await NotificationService_1.NotificationService.delete(req.params.id, req.user.id);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
/**
 * Crée une nouvelle notification.
 * @param req - Requête Express avec corps et utilisateur authentifié
 * @param res - Réponse Express
 * @param next - Fonction middleware suivante
 */
NotificationController.create = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        }
        const notification = await NotificationService_1.NotificationService.create(req.body);
        res.status(201).json(notification);
    }
    catch (err) {
        next(err);
    }
};
/**
 * Crée plusieurs notifications pour une liste d'utilisateurs.
 * @param req - Requête Express avec corps et utilisateur authentifié
 * @param res - Réponse Express
 * @param next - Fonction middleware suivante
 */
NotificationController.createBatch = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        }
        const { message, type, utilisateurIds } = req.body;
        const notifications = await NotificationService_1.NotificationService.createBatch({ message, type }, utilisateurIds || []);
        res.status(201).json(notifications);
    }
    catch (err) {
        next(err);
    }
};
/**
 * Envoie une notification (met à jour dateEnvoi).
 * @param req - Requête Express avec paramètre ID et utilisateur authentifié
 * @param res - Réponse Express
 * @param next - Fonction middleware suivante
 */
NotificationController.envoyer = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        }
        const notification = await NotificationService_1.NotificationService.envoyer(req.params.id);
        res.json(notification);
    }
    catch (err) {
        next(err);
    }
};
exports.default = NotificationController;
//# sourceMappingURL=NotificationController.js.map