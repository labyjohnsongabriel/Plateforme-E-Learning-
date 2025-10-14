// src/controllers/learning/ProgressionController.ts
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { Types } from 'mongoose';
import ProgressionService from '../../services/learning/ProgressionService';
import CertificatService from '../../services/learning/CertificationService';
import { getIO } from '../../utils/socket';
import { IProgression, ProgressionUpdateData, CourseDocument } from '../../types';

/**
 * Contrôleur pour la gestion de la progression d’un utilisateur dans un cours.
 */
class ProgressionController {
  /**
   * 🔹 Récupère la progression d’un utilisateur pour un cours spécifique.
   */
  static getByUserAndCourse = async (
    req: Request<{ coursId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?._id) {
        throw createError(401, 'Utilisateur non authentifié');
      }

      if (!Types.ObjectId.isValid(req.params.coursId)) {
        throw createError(400, 'Identifiant de cours invalide');
      }

      console.log(`📘 Récupération de la progression pour l’utilisateur ${req.user._id} et le cours ${req.params.coursId}`);

      const progression = await ProgressionService.getByUserAndCourse(req.user._id, req.params.coursId);

      res.status(200).json(progression || { pourcentage: 0 });
    } catch (err) {
      console.error('❌ Erreur dans getByUserAndCourse :', err);
      next(err);
    }
  };

  /**
   * 🔹 Met à jour la progression d’un utilisateur et génère un certificat si le cours est terminé.
   */
  static update = async (
    req: Request<{ coursId: string }, {}, ProgressionUpdateData>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?._id) {
        throw createError(401, 'Utilisateur non authentifié');
      }

      if (!Types.ObjectId.isValid(req.params.coursId)) {
        throw createError(400, 'Identifiant de cours invalide');
      }

      console.log(`🔄 Mise à jour de la progression pour l’utilisateur ${req.user._id} et le cours ${req.params.coursId}`);

      const progression: IProgression = await ProgressionService.update(
        req.user._id,
        req.params.coursId,
        req.body.pourcentage
      );

      // 🎓 Génère un certificat si la progression atteint 100 %
      if (progression.pourcentage === 100) {
        const cert = await CertificatService.generateIfEligible(progression);
        if (cert) {
          const io = getIO();
          io.to(progression.apprenant.toString()).emit('new_certificate', cert);
          io.emit('progress_update', {
            userId: progression.apprenant,
            coursId: progression.cours,
          });
        }
      }

      res.status(200).json(progression);
    } catch (err) {
      console.error('❌ Erreur dans update progression :', err);
      next(err);
    }
  };

  /**
   * 🔹 Récupère la progression globale (tous les cours) pour un utilisateur connecté.
   */
  static getGlobalProgress = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?._id) {
        throw createError(401, 'Utilisateur non authentifié');
      }

      console.log(`📊 Récupération de la progression globale pour ${req.user._id}`);

      const globalProgress = await ProgressionService.getGlobalProgress(req.user._id);

      res.status(200).json({
        progress: globalProgress.moyennePourcentage,
        courseProgresses: globalProgress.details.map((prog: IProgression) => {
          const cours = prog.cours as CourseDocument | undefined;

          return {
            coursId: cours?._id?.toString() || (prog.cours as any)?.toString(),
            title: cours?.titre || 'Cours inconnu',
            level: cours?.niveau || 'Inconnu',
            progress: prog.pourcentage,
          };
        }),
      });
    } catch (err: any) {
      console.error('❌ Erreur dans getGlobalProgress :', err);
      next(createError(500, err.message || 'Erreur serveur lors de la récupération de la progression globale'));
    }
  };
}

export default ProgressionController;
