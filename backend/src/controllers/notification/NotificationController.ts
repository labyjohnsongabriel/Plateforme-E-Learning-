// src/controllers/notification/NotificationController.ts
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import * as NotificationService from '../../services/notification/NotificationService';
import { NotificationData } from '../../types';

/**
 * Contrôleur pour gérer les notifications des utilisateurs.
 */
class NotificationController {
  /**
   * Récupère toutes les notifications d'un utilisateur authentifié.
   */
  static getForUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user._id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const notifications = await NotificationService.getForUser(req.user._id);
      res.json(notifications);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Marque une notification comme lue.
   */
  static markAsRead = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user._id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const notification = await NotificationService.markAsRead(req.params.id, req.user._id);
      res.json(notification);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Supprime une notification.
   */
  static deleteNotification = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user._id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const notification = await NotificationService.deleteNotification(req.params.id, req.user._id);
      res.json({ message: 'Notification supprimée avec succès', notification });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Crée une nouvelle notification.
   */
  static create = async (req: Request<{}, {}, NotificationData>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user._id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const notification = await NotificationService.create(req.body);
      res.status(201).json(notification);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Crée plusieurs notifications pour une liste d'utilisateurs.
   */
  static createBatch = async (req: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user._id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const { message, type, utilisateurIds } = req.body;
      const notifications = await NotificationService.createBatch({ message, type }, utilisateurIds || []);
      res.status(201).json(notifications);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Envoie une notification (met à jour dateEnvoi).
   */
  static envoyer = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user._id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const notification = await NotificationService.envoyer(req.params.id);
      res.json(notification);
    } catch (err) {
      next(err);
    }
  };
}

export default NotificationController;