const mongoose = require("mongoose");
const createError = require("http-errors");
const Notification = require("../../models/notification/Notification");
const EmailService = require("./EmailService");
const User = require("../../models/user/User");
const logger = require("../../utils/logger"); // Assuming a logger utility (e.g., winston)

// Assume Socket.IO is exported from a separate module or initialized elsewhere
const { io } = require("../../utils/socket"); // Corrected import (create this module)

class NotificationService {
  // Create a notification
  static async create(data) {
    try {
      // Validate required fields
      if (!data.utilisateur || !data.message || !data.type) {
        throw createError(400, "Utilisateur, message, and type are required");
      }

      // Create and save notification
      const notif = new Notification({
        ...data,
        dateEnvoi: new Date(),
        lu: false, // Default: unread
      });
      await notif.save();

      // Emit real-time notification via Socket.IO
      if (io) {
        io.to(data.utilisateur.toString()).emit("new_notification", {
          id: notif._id,
          message: notif.message,
          type: notif.type,
          dateEnvoi: notif.dateEnvoi,
          lu: notif.lu,
        });
        logger.info(
          `Notification emitted to user ${data.utilisateur}: ${notif.message}`
        );
      } else {
        logger.warn(
          "Socket.IO not initialized, skipping real-time notification"
        );
      }

      // Send email notification
      const user = await User.findById(data.utilisateur);
      if (!user) {
        throw createError(404, "Utilisateur non trouvé");
      }
      await EmailService.sendNotification(
        user.email,
        notif.message,
        notif.type
      );
      logger.info(`Email sent to ${user.email} for notification ${notif._id}`);

      return notif;
    } catch (err) {
      logger.error(`Error creating notification: ${err.message}`);
      throw err;
    }
  }

  // Get notifications for a user
  static async getForUser(userId) {
    try {
      if (!mongoose.isValidObjectId(userId)) {
        throw createError(400, "Invalid user ID");
      }
      return await Notification.find({ utilisateur: userId })
        .sort({ dateEnvoi: -1 }) // Sort by dateEnvoi descending
        .populate("utilisateur", "nom email");
    } catch (err) {
      logger.error(
        `Error fetching notifications for user ${userId}: ${err.message}`
      );
      throw err;
    }
  }

  // Mark a notification as read
  static async markAsRead(id, userId) {
    try {
      if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(userId)) {
        throw createError(400, "Invalid notification or user ID");
      }
      const notif = await Notification.findOneAndUpdate(
        { _id: id, utilisateur: userId },
        { lu: true },
        { new: true }
      );
      if (!notif) {
        throw createError(404, "Notification non trouvée");
      }
      logger.info(`Notification ${id} marked as read for user ${userId}`);
      return notif;
    } catch (err) {
      logger.error(`Error marking notification ${id} as read: ${err.message}`);
      throw err;
    }
  }

  // Delete a notification
  static async delete(id, userId) {
    try {
      if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(userId)) {
        throw createError(400, "Invalid notification or user ID");
      }
      const notif = await Notification.findOneAndDelete({
        _id: id,
        utilisateur: userId,
      });
      if (!notif) {
        throw createError(404, "Notification non trouvée");
      }
      logger.info(`Notification ${id} deleted for user ${userId}`);
      return notif;
    } catch (err) {
      logger.error(`Error deleting notification ${id}: ${err.message}`);
      throw err;
    }
  }

  // Innovation: Batch send notifications to multiple users (e.g., course announcement)
  static async createBatch(data, utilisateurIds) {
    try {
      const notifications = utilisateurIds.map((userId) => ({
        ...data,
        utilisateur: userId,
        dateEnvoi: new Date(),
        lu: false,
      }));
      const savedNotifications = await Notification.insertMany(notifications);

      // Emit to all users
      if (io) {
        utilisateurIds.forEach((userId) => {
          savedNotifications.forEach((notif) => {
            if (notif.utilisateur.toString() === userId.toString()) {
              io.to(userId.toString()).emit("new_notification", {
                id: notif._id,
                message: notif.message,
                type: notif.type,
                dateEnvoi: notif.dateEnvoi,
                lu: notif.lu,
              });
            }
          });
        });
        logger.info(
          `Batch notifications emitted to ${utilisateurIds.length} users`
        );
      }

      // Send emails
      const users = await User.find({ _id: { $in: utilisateurIds } });
      await Promise.all(
        users.map((user) =>
          EmailService.sendNotification(user.email, data.message, data.type)
        )
      );
      logger.info(`Batch emails sent to ${users.length} users`);

      return savedNotifications;
    } catch (err) {
      logger.error(`Error creating batch notifications: ${err.message}`);
      throw err;
    }
  }

  // Innovation: Method to implement envoyer() from UML
  static async envoyer(notificationId) {
    try {
      const notif = await Notification.findById(notificationId).populate(
        "utilisateur",
        "email"
      );
      if (!notif) {
        throw createError(404, "Notification non trouvée");
      }
      // Re-send email
      await EmailService.sendNotification(
        notif.utilisateur.email,
        notif.message,
        notif.type
      );
      // Re-emit via Socket.IO
      if (io) {
        io.to(notif.utilisateur._id.toString()).emit("new_notification", {
          id: notif._id,
          message: notif.message,
          type: notif.type,
          dateEnvoi: notif.dateEnvoi,
          lu: notif.lu,
        });
        logger.info(
          `Notification ${notificationId} re-emitted to user ${notif.utilisateur._id}`
        );
      }
      logger.info(
        `Notification ${notificationId} re-sent to ${notif.utilisateur.email}`
      );
      return notif;
    } catch (err) {
      logger.error(
        `Error re-sending notification ${notificationId}: ${err.message}`
      );
      throw err;
    }
  }
}

module.exports = NotificationService;
