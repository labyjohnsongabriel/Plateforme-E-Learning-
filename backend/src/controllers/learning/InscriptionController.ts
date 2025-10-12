// src/controllers/learning/InscriptionController.ts
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import InscriptionService from '../../services/learning/InscriptionService';
import { InscriptionData, StatutInscription } from '../../types'; // Corrected import

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
      console.log(`Enrolling user ${req.user.id} in course ${req.body.coursId}`);
      const inscription = await InscriptionService.enroll(req.user.id, req.body.coursId);
      res.status(201).json(inscription);
    } catch (err) {
      console.error('Error in enroll:', err);
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
      console.log(`Fetching enrollments for user ${req.user.id}`);
      const enrollments = await InscriptionService.getUserEnrollments(req.user.id);
      res.json(enrollments);
    } catch (err) {
      console.error('Error in getUserEnrollments:', err);
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
      console.log(`Updating enrollment ${req.params.id} status to ${req.body.statut}`);
      const inscription = await InscriptionService.updateStatus(
        req.params.id,
        req.body.statut,
        req.user.id
      );
      res.json(inscription);
    } catch (err) {
      console.error('Error in updateStatus:', err);
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
      console.log(`Deleting enrollment ${req.params.id} for user ${req.user.id}`);
      const result = await InscriptionService.deleteEnrollment(req.params.id, req.user.id);
      res.json(result);
    } catch (err) {
      console.error('Error in deleteEnrollment:', err);
      next(err);
    }
  };
}

export default InscriptionController;