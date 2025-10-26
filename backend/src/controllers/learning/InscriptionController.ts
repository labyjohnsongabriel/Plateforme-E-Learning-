// src/controllers/learning/InscriptionController.ts
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import InscriptionService from '../../services/learning/InscriptionService';
import { StatutInscription } from '../../models/enums/StatutInscription';
import { Types } from 'mongoose';

class InscriptionController {
  // =======================
  // ✅ 1. INSCRIPTION D’UN UTILISATEUR
  // =======================
  static enroll = async (
    req: Request<{}, {}, { coursId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = InscriptionController.getUserId(req);
      const { coursId } = req.body;

      if (!Types.ObjectId.isValid(coursId)) {
        throw createError(400, 'Identifiant de cours invalide');
      }

      const inscription = await InscriptionService.enroll(userId, coursId);
      res.status(201).json({ data: inscription });
    } catch (err) {
      next(err);
    }
  };

  // =======================
  // ✅ 2. RÉCUPÉRER LES INSCRIPTIONS D’UN UTILISATEUR
  // =======================
  static getUserEnrollments = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = InscriptionController.getUserId(req);
      const enrollments = await InscriptionService.getUserEnrollments(userId);
      res.json({ data: enrollments });
    } catch (err) {
      next(err);
    }
  };

  // =======================
  // ✅ 3. MISE À JOUR DU STATUT D’UNE INSCRIPTION
  // =======================
  static updateStatus = async (
    req: Request<{ id: string }, {}, { statut: StatutInscription }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = InscriptionController.getUserId(req);
      const { id } = req.params;
      const { statut } = req.body;

      if (!id) throw createError(400, 'ID manquant dans la requête');
      if (!Object.values(StatutInscription).includes(statut)) {
        throw createError(400, 'Statut d’inscription invalide');
      }

      const inscription = await InscriptionService.updateStatus(id, statut, userId);
      res.json({ data: inscription });
    } catch (err) {
      next(err);
    }
  };

  // =======================
  // ✅ 4. SUPPRESSION D’UNE INSCRIPTION
  // =======================
  static delete = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = InscriptionController.getUserId(req);
      const { id } = req.params;

      if (!id) throw createError(400, 'ID manquant dans la requête');

      const result = await InscriptionService.deleteEnrollment(id, userId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  // =======================
  // ✅ 5. MÉTHODE PRIVÉE POUR RÉCUPÉRER L’ID UTILISATEUR
  // =======================
  private static getUserId(req: Request): string {
    const id = req.user?._id?.toString();
    if (!id) throw createError(401, 'Non authentifié');
    return id;
  }
}

export default InscriptionController;
