// InscriptionController
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import InscriptionService from '../../services/learning/InscriptionService';
import { InscriptionData } from '../../types';
import { StatutInscription } from '../../models/enums/StatutInscription';

class InscriptionController {
  static enroll = async (
    req: Request<{}, {}, InscriptionData>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?._id) {
        throw createError(401, 'Utilisateur non authentifié');
      }

      const inscription = await InscriptionService.enroll(
        req.user._id.toString(),
        req.body.coursId
      );
      res.status(201).json(inscription);
    } catch (err) {
      next(err);
    }
  };

  static getUserEnrollments = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?._id) {
        throw createError(401, 'Utilisateur non authentifié');
      }

      const enrollments = await InscriptionService.getUserEnrollments(
        req.user._id.toString()
      );
      res.json(enrollments);
    } catch (err) {
      next(err);
    }
  };

  static updateStatus = async (
    req: Request<{ id: string }, {}, { statut: StatutInscription }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?._id) {
        throw createError(401, 'Utilisateur non authentifié');
      }

      const inscription = await InscriptionService.updateStatus(
        req.params.id,
        req.body.statut,
        req.user._id.toString()
      );
      res.json(inscription);
    } catch (err) {
      next(err);
    }
  };

  static delete = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?._id) {
        throw createError(401, 'Utilisateur non authentifié');
      }

      const result = await InscriptionService.deleteEnrollment(
        req.params.id,
        req.user._id.toString()
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

export default InscriptionController;