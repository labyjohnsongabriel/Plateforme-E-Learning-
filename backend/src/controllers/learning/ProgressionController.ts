import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { ProgressionService } from '../../services/learning/ProgressionService';
import { CertificatService } from '../../services/learning/CertificationService';
import { getIo } from '../../utils/socket';
import { ProgressionDocument, ProgressionUpdateData } from '../../types';

/**
 * Contrôleur pour gérer la progression des utilisateurs dans les cours.
 */
class ProgressionController {
  /**
   * Récupère la progression d'un utilisateur pour un cours spécifique.
   * @param req - Requête Express avec paramètre coursId et utilisateur authentifié
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static getByUserAndCourse = async (req: Request<{ coursId: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const progression = await ProgressionService.getByUserAndCourse(req.user.id, req.params.coursId);
      res.json(progression || { pourcentage: 0 }); // Retourne 0 si pas de progression
    } catch (err) {
      next(err);
    }
  };

  /**
   * Met à jour la progression d'un utilisateur dans un cours et génère un certificat si nécessaire.
   * @param req - Requête Express avec paramètre coursId, corps (pourcentage), et utilisateur authentifié
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static update = async (req: Request<{ coursId: string }, {}, ProgressionUpdateData>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const progression = await ProgressionService.update(req.user.id, req.params.coursId, req.body.pourcentage);
      
      if (progression.pourcentage === 100) {
        const cert = await CertificatService.generateIfEligible(progression);
        if (cert) {
          // Notification real-time à l'utilisateur
          const io = getIo();
          io.to(progression.apprenant.toString()).emit('new_certificate', cert);
          // Optionnel : Emit à admin pour tableau de bord
          io.emit('progress_update', { userId: progression.apprenant, coursId: progression.cours });
        }
      }
      res.json(progression);
    } catch (err) {
      console.error('Erreur controller update progression:', (err as Error).message);
      next(err);
    }
  };
}

export default ProgressionController;