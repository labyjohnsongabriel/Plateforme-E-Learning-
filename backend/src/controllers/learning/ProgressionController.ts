// src/controllers/learning/ProgressionController.ts
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import ProgressionService from '../../services/learning/ProgressionService';
import CertificatService from '../../services/learning/CertificationService';
import { getIO } from '../../utils/socket';
import { IProgression, ProgressionUpdateData } from '../../types';

/**
 * Controller for managing user progress in courses.
 */
class ProgressionController {
  /**
   * Retrieves a user's progress for a specific course.
   */
  static getByUserAndCourse = async (
    req: Request<{ coursId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      console.log(`Fetching progress for user ${req.user.id} and course ${req.params.coursId}`);
      const progression = await ProgressionService.getByUserAndCourse(
        req.user.id,
        req.params.coursId
      );
      res.json(progression || { pourcentage: 0 });
    } catch (err) {
      console.error('Error in getByUserAndCourse:', err);
      next(err);
    }
  };

  /**
   * Updates a user's progress and generates a certificate if eligible.
   */
  static update = async (
    req: Request<{ coursId: string }, {}, ProgressionUpdateData>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      console.log(`Updating progress for user ${req.user.id} and course ${req.params.coursId}`);
      const progression: IProgression = await ProgressionService.update(
        req.user.id,
        req.params.coursId,
        req.body.pourcentage
      );

      // Generate certificate if progress is 100%
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

      res.json(progression);
    } catch (err) {
      console.error('Error in update progression:', err);
      next(err);
    }
  };
}

export default ProgressionController;