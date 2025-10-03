import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { InscriptionService } from '../../services/learning/InscriptionService';
import { InscriptionDocument, InscriptionData } from '../../types';

/**
 * Contrôleur pour gérer les inscriptions des utilisateurs à des cours.
 */
class InscriptionController {
  /**
   * Inscrit un utilisateur à un cours.
   * @param req - Requête Express avec corps et utilisateur authentifié
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static enroll = async (req: Request<{}, {}, InscriptionData>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const inscription = await InscriptionService.enroll(req.user.id, req.body.coursId);
      res.status(201).json(inscription);
    } catch (err) {
      console.error('Erreur controller enroll:', (err as Error).message);
      next(err);
    }
  };

  /**
   * Récupère toutes les inscriptions d'un utilisateur.
   * @param req - Requête Express avec utilisateur authentifié
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static getUserEnrollments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const enrollments = await InscriptionService.getUserEnrollments(req.user.id);
      res.json(enrollments);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Met à jour le statut d'une inscription.
   * @param req - Requête Express avec paramètre ID et corps
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static updateStatus = async (req: Request<{ id: string }, {}, { statut: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const inscription = await InscriptionService.updateStatus(req.params.id, req.body.statut, req.user.id);
      res.json(inscription);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Supprime une inscription.
   * @param req - Requête Express avec paramètre ID
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static delete = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const result = await InscriptionService.deleteEnrollment(req.params.id, req.user.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

export default InscriptionController;