import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import createError from 'http-errors';
import { Types } from 'mongoose';
import ProgressionService from '../../services/learning/ProgressionService';
import CertificatService from '../../services/learning/CertificationService';
import { getIO } from '../../utils/socket';
import { IProgression, ProgressionUpdateData, CourseDocument } from '../../types';

class ProgressionController {
  static getByUserAndCourse = async (
    req: Request<{ coursId?: string; courseId?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, 'Validation failed', { errors: errors.array() });
      }

      if (!req.user?._id) {
        throw createError(401, 'Utilisateur non authentifié');
      }

      // Gérer les deux paramètres possibles (coursId ou courseId)
      const courseId = req.params.coursId || req.params.courseId;
      
      if (!courseId || !Types.ObjectId.isValid(courseId)) {
        throw createError(400, 'Identifiant de cours invalide');
      }

      console.log(`📘 Récupération de la progression pour l'utilisateur ${req.user._id} et le cours ${courseId}`);

      const progression = await ProgressionService.getByUserAndCourse(req.user._id, courseId);

      res.status(200).json(progression);
    } catch (err: any) {
      console.error('❌ Erreur dans getByUserAndCourse :', {
        message: err.message,
        stack: err.stack,
        userId: req.user?._id,
        coursId: req.params.coursId || req.params.courseId,
      });
      next(createError(err.status || 500, err.message || 'Erreur serveur lors de la récupération de la progression'));
    }
  };

  static update = async (
    req: Request<{ coursId: string }, {}, ProgressionUpdateData>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, 'Validation failed', { errors: errors.array() });
      }

      if (!req.user?._id) {
        throw createError(401, 'Utilisateur non authentifié');
      }

      if (!Types.ObjectId.isValid(req.params.coursId)) {
        throw createError(400, 'Identifiant de cours invalide');
      }

      console.log(`🔄 Mise à jour de la progression pour l'utilisateur ${req.user._id} et le cours ${req.params.coursId}`);

      const progression: IProgression = await ProgressionService.update(
        req.user._id,
        req.params.coursId,
        req.body.pourcentage
      );

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
    } catch (err: any) {
      console.error('❌ Erreur dans update progression :', {
        message: err.message,
        stack: err.stack,
        userId: req.user?._id,
        coursId: req.params.coursId,
      });
      next(createError(err.status || 500, err.message || 'Erreur serveur lors de la mise à jour de la progression'));
    }
  };

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
      console.error('❌ Erreur dans getGlobalProgress :', {
        message: err.message,
        stack: err.stack,
        userId: req.user?._id,
      });
      next(createError(500, err.message || 'Erreur serveur lors de la récupération de la progression globale'));
    }
  };

  // ✅ NOUVELLE MÉTHODE POUR MARQUER UN CONTENU COMME COMPLÉTÉ
  static markContentComplete = async (
    req: Request<{}, {}, { courseId: string; contenuId?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, 'Validation failed', { errors: errors.array() });
      }

      if (!req.user?._id) {
        throw createError(401, 'Utilisateur non authentifié');
      }

      const { courseId, contenuId } = req.body;

      if (!Types.ObjectId.isValid(courseId)) {
        throw createError(400, 'Identifiant de cours invalide');
      }

      console.log(`✅ Marquage du contenu comme complété - User: ${req.user._id}, Cours: ${courseId}, Contenu: ${contenuId}`);

      // Récupérer la progression actuelle
      const progression = await ProgressionService.getByUserAndCourse(req.user._id, courseId);
      
      let newPercentage = progression.pourcentage;

      // Si un contenu spécifique est fourni, augmenter le pourcentage
      if (contenuId) {
        // Logique pour calculer le nouveau pourcentage basé sur le contenu complété
        // Pour l'instant, on augmente de 10% à chaque contenu complété (à adapter)
        newPercentage = Math.min(100, progression.pourcentage + 10);
      } else {
        // Si pas de contenu spécifique, marquer comme 100% complété
        newPercentage = 100;
      }

      // Mettre à jour la progression
      const updatedProgression = await ProgressionService.update(
        req.user._id,
        courseId,
        newPercentage
      );

      res.status(200).json({
        success: true,
        progression: updatedProgression,
        message: 'Progression mise à jour avec succès'
      });
    } catch (err: any) {
      console.error('❌ Erreur dans markContentComplete :', {
        message: err.message,
        stack: err.stack,
        userId: req.user?._id,
        courseId: req.body.courseId,
      });
      next(createError(err.status || 500, err.message || 'Erreur serveur lors de la mise à jour de la progression'));
    }
  };
}

export default ProgressionController;