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
exports.envoyer = exports.createBatch = exports.deleteNotification = exports.markAsRead = exports.getForUser = exports.create = void 0;
const mongoose_1 = require("mongoose");
const http_errors_1 = __importDefault(require("http-errors"));
const Notification_1 = __importDefault(require("../../models/notification/Notification"));
const EmailService = __importStar(require("./EmailService"));
const User_1 = __importDefault(require("../../models/user/User"));
const logger_1 = __importDefault(require("../../utils/logger"));
const socket_1 = require("../../utils/socket");
// Create a notification
const create = async (data) => {
    try {
        if (!data.utilisateur || !data.message || !data.type) {
            throw (0, http_errors_1.default)(400, 'Utilisateur, message, and type are required');
        }
        const notif = new Notification_1.default({
            ...data,
            dateEnvoi: new Date(),
            lu: false,
        });
        await notif.save();
        if (socket_1.io) {
            socket_1.io.to(data.utilisateur.toString()).emit('new_notification', {
                id: notif._id,
                message: notif.message,
                type: notif.type,
                dateEnvoi: notif.dateEnvoi,
                lu: notif.lu,
            });
            logger_1.default.info(`Notification emitted to user ${data.utilisateur}: ${notif.message}`);
        }
        else {
            logger_1.default.warn('Socket.IO not initialized, skipping real-time notification');
        }
        const user = await User_1.default.findById(data.utilisateur);
        if (!user) {
            throw (0, http_errors_1.default)(404, 'Utilisateur non trouvé');
        }
        await EmailService.sendNotification(user.email, notif.message);
        logger_1.default.info(`Email sent to ${user.email} for notification ${notif._id}`);
        return notif;
    }
    catch (err) {
        logger_1.default.error(`Error creating notification: ${err.message}`);
        throw err;
    }
};
exports.create = create;
// Get notifications for a user
const getForUser = async (userId) => {
    try {
        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
            throw (0, http_errors_1.default)(400, 'Invalid user ID');
        }
        return await Notification_1.default.find({ utilisateur: userId })
            .sort({ dateEnvoi: -1 })
            .populate('utilisateur', 'nom email');
    }
    catch (err) {
        logger_1.default.error(`Error fetching notifications for user ${userId}: ${err.message}`);
        throw err;
    }
};
exports.getForUser = getForUser;
// Mark a notification as read
const markAsRead = async (id, userId) => {
    try {
        if (!mongoose_1.Types.ObjectId.isValid(id) || !mongoose_1.Types.ObjectId.isValid(userId)) {
            throw (0, http_errors_1.default)(400, 'Invalid notification or user ID');
        }
        const notif = await Notification_1.default.findOneAndUpdate({ _id: id, utilisateur: userId }, { lu: true }, { new: true });
        if (!notif) {
            throw (0, http_errors_1.default)(404, 'Notification non trouvée');
        }
        logger_1.default.info(`Notification ${id} marked as read for user ${userId}`);
        return notif;
    }
    catch (err) {
        logger_1.default.error(`Error marking notification ${id} as read: ${err.message}`);
        throw err;
    }
};
exports.markAsRead = markAsRead;
// Delete a notification
const deleteNotification = async (id, userId) => {
    try {
        if (!mongoose_1.Types.ObjectId.isValid(id) || !mongoose_1.Types.ObjectId.isValid(userId)) {
            throw (0, http_errors_1.default)(400, 'Invalid notification or user ID');
        }
        const notif = await Notification_1.default.findOneAndDelete({ _id: id, utilisateur: userId });
        if (!notif) {
            throw (0, http_errors_1.default)(404, 'Notification non trouvée');
        }
        logger_1.default.info(`Notification ${id} deleted for user ${userId}`);
        return notif;
    }
    catch (err) {
        logger_1.default.error(`Error deleting notification ${id}: ${err.message}`);
        throw err;
    }
};
exports.deleteNotification = deleteNotification;
// Batch send notifications
const createBatch = async (data, utilisateurIds) => {
    try {
        const notifications = utilisateurIds.map((userId) => ({
            ...data,
            utilisateur: userId,
            dateEnvoi: new Date(),
            lu: false,
        }));
        const savedNotifications = await Notification_1.default.insertMany(notifications);
        if (socket_1.io) {
            utilisateurIds.forEach((userId) => {
                savedNotifications.forEach((notif) => {
                    if (notif.utilisateur.toString() === userId.toString()) {
                        socket_1.io.to(userId.toString()).emit('new_notification', {
                            id: notif._id,
                            message: notif.message,
                            type: notif.type,
                            dateEnvoi: notif.dateEnvoi,
                            lu: notif.lu,
                        });
                    }
                });
            });
            logger_1.default.info(`Batch notifications emitted to ${utilisateurIds.length} users`);
        }
        const users = await User_1.default.find({ _id: { $in: utilisateurIds } });
        await Promise.all(users.map((user) => EmailService.sendNotification(user.email, data.message)));
        logger_1.default.info(`Batch emails sent to ${users.length} users`);
        return savedNotifications;
    }
    catch (err) {
        logger_1.default.error(`Error creating batch notifications: ${err.message}`);
        throw err;
    }
};
exports.createBatch = createBatch;
// Re-send a notification
const envoyer = async (notificationId) => {
    try {
        const notif = await Notification_1.default.findById(notificationId).populate('utilisateur', 'email');
        if (!notif) {
            throw (0, http_errors_1.default)(404, 'Notification non trouvée');
        }
        await EmailService.sendNotification(notif.utilisateur.email, notif.message);
        if (socket_1.io) {
            socket_1.io.to(notif.utilisateur._id.toString()).emit('new_notification', {
                id: notif._id,
                message: notif.message,
                type: notif.type,
                dateEnvoi: notif.dateEnvoi,
                lu: notif.lu,
            });
            logger_1.default.info(`Notification ${notificationId} re-emitted to user ${notif.utilisateur._id}`);
        }
        logger_1.default.info(`Notification ${notificationId} re-sent to ${notif.utilisateur.email}`);
        return notif;
    }
    catch (err) {
        logger_1.default.error(`Error re-sending notification ${notificationId}: ${err.message}`);
        throw err;
    }
};
exports.envoyer = envoyer;
//# sourceMappingURL=NotificationService.js.map