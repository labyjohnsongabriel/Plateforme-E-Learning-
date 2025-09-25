// src/controllers/notification/NotificationController.js
const NotificationService = require("../../services/notification/NotificationService");
const createError = require("http-errors");

module.exports = {
  getForUser: async (req, res, next) => {
    try {
      const notifications = await NotificationService.getForUser(req.user.id);
      res.json(notifications);
    } catch (err) {
      next(err);
    }
  },

  markAsRead: async (req, res, next) => {
    try {
      const notification = await NotificationService.markAsRead(
        req.params.id,
        req.user.id
      );
      res.json(notification);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      await NotificationService.delete(req.params.id, req.user.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const notification = await NotificationService.create(req.body);
      res.status(201).json(notification);
    } catch (err) {
      next(err);
    }
  },

  createBatch: async (req, res, next) => {
    try {
      const { message, type, utilisateurIds } = req.body;
      const notifications = await NotificationService.createBatch(
        { message, type },
        utilisateurIds
      );
      res.status(201).json(notifications);
    } catch (err) {
      next(err);
    }
  },

  envoyer: async (req, res, next) => {
    try {
      const notification = await NotificationService.envoyer(req.params.id);
      res.json(notification);
    } catch (err) {
      next(err);
    }
  },
};
