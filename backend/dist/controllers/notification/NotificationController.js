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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const NotificationService = __importStar(require("../../services/notification/NotificationService"));
/**
 * Contrôleur pour gérer les notifications des utilisateurs.
 */
class NotificationController {
}
_a = NotificationController;
/**
 * Récupère toutes les notifications d'un utilisateur authentifié.
 */
NotificationController.getForUser = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        }
        const notifications = await NotificationService.getForUser(req.user.id);
        res.json(notifications);
    }
    catch (err) {
        next(err);
    }
};
/**
 * Marque une notification comme lue.
 */
NotificationController.markAsRead = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        }
        const notification = await NotificationService.markAsRead(req.params.id, req.user.id);
        res.json(notification);
    }
    catch (err) {
        next(err);
    }
};
/**
 * Supprime une notification.
 */
NotificationController.deleteNotification = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        }
        const notification = await NotificationService.deleteNotification(req.params.id, req.user.id);
        res.json({ message: 'Notification supprimée avec succès', notification });
    }
    catch (err) {
        next(err);
    }
};
/**
 * Crée une nouvelle notification.
 */
NotificationController.create = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        }
        const notification = await NotificationService.create(req.body);
        res.status(201).json(notification);
    }
    catch (err) {
        next(err);
    }
};
/**
 * Crée plusieurs notifications pour une liste d'utilisateurs.
 */
NotificationController.createBatch = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        }
        const { message, type, utilisateurIds } = req.body;
        const notifications = await NotificationService.createBatch({ message, type }, utilisateurIds || []);
        res.status(201).json(notifications);
    }
    catch (err) {
        next(err);
    }
};
/**
 * Envoie une notification (met à jour dateEnvoi).
 */
NotificationController.envoyer = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        }
        const notification = await NotificationService.envoyer(req.params.id);
        res.json(notification);
    }
    catch (err) {
        next(err);
    }
};
exports.default = NotificationController;
//# sourceMappingURL=NotificationController.js.map