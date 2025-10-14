// src/controllers/learning/InscriptionController.ts
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import InscriptionService from '../../services/learning/InscriptionService';
import { InscriptionData } from '../../types';
import { StatutInscription } from '../../models/enums/StatutInscription'; // Updated import

class InscriptionController {
  /**
   * Enrolls a user in a course.
   */
  static enroll = async (
    req: Request<{}, {}, InscriptionData>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const inscription = await InscriptionService.enroll(req.user.id, req.body.coursId);
      res.status(201).json(inscription);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Retrieves all enrollments for the authenticated user.
   */
  static getUserEnrollments = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const enrollments = await InscriptionService.getUserEnrollments(req.user.id);
      res.json(enrollments);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Updates the status of an enrollment.
   */
  static updateStatus = async (
    req: Request<{ id: string }, {}, { statut: StatutInscription }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const inscription = await InscriptionService.updateStatus(
        req.params.id,
        req.body.statut,
        req.user.id
      );
      res.json(inscription);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Deletes an enrollment.
   */
  static delete = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?.id) {
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