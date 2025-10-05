import { Types } from 'mongoose';
import createError from 'http-errors';
import Notification, { INotification } from '../../models/notification/Notification';
import * as EmailService from './EmailService';
import User, { IUser } from '../../models/user/User';
import logger from '../../utils/logger';
import { io } from '../../utils/socket';

// Interface for notification creation data
interface NotificationData {
  utilisateur: string | Types.ObjectId;
  message: string;
  type: string;
  lu?: boolean;
  dateEnvoi?: Date;
}

// Create a notification
export const create = async (data: NotificationData): Promise<INotification> => {
  try {
    if (!data.utilisateur || !data.message || !data.type) {
      throw createError(400, 'Utilisateur, message, and type are required');
    }

    const notif = new Notification({
      ...data,
      dateEnvoi: new Date(),
      lu: false,
    });
    await notif.save();

    if (io) {
      io.to(data.utilisateur.toString()).emit('new_notification', {
        id: notif._id,
        message: notif.message,
        type: notif.type,
        dateEnvoi: notif.dateEnvoi,
        lu: notif.lu,
      });
      logger.info(`Notification emitted to user ${data.utilisateur}: ${notif.message}`);
    } else {
      logger.warn('Socket.IO not initialized, skipping real-time notification');
    }

    const user = await User.findById(data.utilisateur);
    if (!user) {
      throw createError(404, 'Utilisateur non trouvé');
    }
    await EmailService.sendNotification(user.email, notif.message);
    logger.info(`Email sent to ${user.email} for notification ${notif._id}`);

    return notif;
  } catch (err) {
    logger.error(`Error creating notification: ${(err as Error).message}`);
    throw err;
  }
};

// Get notifications for a user
export const getForUser = async (userId: string | Types.ObjectId): Promise<INotification[]> => {
  try {
    if (!Types.ObjectId.isValid(userId)) {
      throw createError(400, 'Invalid user ID');
    }
    return await Notification.find({ utilisateur: userId })
      .sort({ dateEnvoi: -1 })
      .populate('utilisateur', 'nom email');
  } catch (err) {
    logger.error(`Error fetching notifications for user ${userId}: ${(err as Error).message}`);
    throw err;
  }
};

// Mark a notification as read
export const markAsRead = async (id: string | Types.ObjectId, userId: string | Types.ObjectId): Promise<INotification> => {
  try {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
      throw createError(400, 'Invalid notification or user ID');
    }
    const notif = await Notification.findOneAndUpdate(
      { _id: id, utilisateur: userId },
      { lu: true },
      { new: true }
    );
    if (!notif) {
      throw createError(404, 'Notification non trouvée');
    }
    logger.info(`Notification ${id} marked as read for user ${userId}`);
    return notif;
  } catch (err) {
    logger.error(`Error marking notification ${id} as read: ${(err as Error).message}`);
    throw err;
  }
};

// Delete a notification
export const deleteNotification = async (id: string | Types.ObjectId, userId: string | Types.ObjectId): Promise<INotification> => {
  try {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
      throw createError(400, 'Invalid notification or user ID');
    }
    const notif = await Notification.findOneAndDelete({ _id: id, utilisateur: userId });
    if (!notif) {
      throw createError(404, 'Notification non trouvée');
    }
    logger.info(`Notification ${id} deleted for user ${userId}`);
    return notif;
  } catch (err) {
    logger.error(`Error deleting notification ${id}: ${(err as Error).message}`);
    throw err;
  }
};

// Batch send notifications
export const createBatch = async (data: Omit<NotificationData, 'utilisateur'>, utilisateurIds: (string | Types.ObjectId)[]): Promise<INotification[]> => {
  try {
    const notifications = utilisateurIds.map((userId) => ({
      ...data,
      utilisateur: userId,
      dateEnvoi: new Date(),
      lu: false,
    }));
    const savedNotifications = await Notification.insertMany(notifications);

    if (io) {
      utilisateurIds.forEach((userId) => {
        savedNotifications.forEach((notif) => {
          if (notif.utilisateur.toString() === userId.toString()) {
            io.to(userId.toString()).emit('new_notification', {
              id: notif._id,
              message: notif.message,
              type: notif.type,
              dateEnvoi: notif.dateEnvoi,
              lu: notif.lu,
            });
          }
        });
      });
      logger.info(`Batch notifications emitted to ${utilisateurIds.length} users`);
    }

    const users = await User.find({ _id: { $in: utilisateurIds } });
    await Promise.all(
      users.map((user) => EmailService.sendNotification(user.email, data.message))
    );
    logger.info(`Batch emails sent to ${users.length} users`);

    return savedNotifications;
  } catch (err) {
    logger.error(`Error creating batch notifications: ${(err as Error).message}`);
    throw err;
  }
};

// Re-send a notification
export const envoyer = async (notificationId: string | Types.ObjectId): Promise<INotification> => {
  try {
    const notif = await Notification.findById(notificationId).populate('utilisateur', 'email');
    if (!notif) {
      throw createError(404, 'Notification non trouvée');
    }
    await EmailService.sendNotification(notif.utilisateur.email, notif.message);
    if (io) {
      io.to(notif.utilisateur._id.toString()).emit('new_notification', {
        id: notif._id,
        message: notif.message,
        type: notif.type,
        dateEnvoi: notif.dateEnvoi,
        lu: notif.lu,
      });
      logger.info(`Notification ${notificationId} re-emitted to user ${notif.utilisateur._id}`);
    }
    logger.info(`Notification ${notificationId} re-sent to ${notif.utilisateur.email}`);
    return notif;
  } catch (err) {
    logger.error(`Error re-sending notification ${notificationId}: ${(err as Error).message}`);
    throw err;
  }
};