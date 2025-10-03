import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { NotificationService } from '../../services/notification/NotificationService';
import { NotificationDocument, NotificationData } from '../../types';

/**
 * Contrôleur pour gérer les notifications des utilisateurs.
 */
class NotificationController {
  /**
   * Récupère toutes les notifications d'un utilisateur authentifié.
   * @param req - Requête Express avec utilisateur authentifié
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static getForUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const notifications = await NotificationService.getForUser(req.user.id);
      res.json(notifications);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Marque une notification comme lue.
   * @param req - Requête Express avec paramètre ID et utilisateur authentifié
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static markAsRead = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const notification = await NotificationService.markAsRead(req.params.id, req.user.id);
      res.json(notification);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Supprime une notification.
   * @param req - Requête Express avec paramètre ID et utilisateur authentifié
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static delete = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      await NotificationService.delete(req.params.id, req.user.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  /**
   * Crée une nouvelle notification.
   * @param req - Requête Express avec corps et utilisateur authentifié
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static create = async (req: Request<{}, {}, NotificationData>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
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
   * @param req - Requête Express avec corps et utilisateur authentifié
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static createBatch = async (req: Request<{}, {}, NotificationData>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
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
   * @param req - Requête Express avec paramètre ID et utilisateur authentifié
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static envoyer = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
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