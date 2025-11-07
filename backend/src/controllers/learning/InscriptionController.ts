import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import InscriptionService from '../../services/learning/InscriptionService';
import { StatutInscription } from '../../models/enums/StatutInscription';
import { Types } from 'mongoose';

class InscriptionController {
  // =======================
  // ✅ INSCRIPTION D'UN UTILISATEUR
  // =======================
  static enroll = async (
    req: Request<{}, {}, { coursId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = InscriptionController.getUserId(req);
      const { coursId } = req.body;

      console.log('Requête d\'inscription reçue:', { userId, coursId });

      if (!coursId) {
        throw createError(400, 'L\'identifiant du cours est requis');
      }

      if (!Types.ObjectId.isValid(coursId)) {
        throw createError(400, 'Identifiant de cours invalide');
      }

      const inscription = await InscriptionService.enroll(userId, coursId);
      
      res.status(201).json({ 
        success: true,
        message: 'Inscription réussie',
        data: inscription 
      });
    } catch (err) {
      console.error('Erreur dans enroll:', err);
      next(err);
    }
  };

  // =======================
  // ✅ RÉCUPÉRER LES INSCRIPTIONS D'UN UTILISATEUR
  // =======================
  static getUserEnrollments = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = InscriptionController.getUserId(req);
      console.log('Récupération des inscriptions pour user:', userId);

      const enrollments = await InscriptionService.getUserEnrollments(userId);
      
      res.json({ 
        success: true,
        data: enrollments,
        count: enrollments.length
      });
    } catch (err) {
      console.error('Erreur dans getUserEnrollments:', err);
      next(err);
    }
  };

  // =======================
  // ✅ RÉCUPÉRER LES ÉTUDIANTS D'UN INSTRUCTEUR - NOUVEAU
  // =======================
  static getInstructorStudents = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const instructorId = InscriptionController.getUserId(req);
      console.log('Récupération des étudiants pour instructeur:', instructorId);

      const result = await InscriptionService.getInstructorStudents(instructorId);
      
      res.json({ 
        success: true,
        ...result
      });
    } catch (err) {
      console.error('Erreur dans getInstructorStudents:', err);
      next(err);
    }
  };

  // =======================
  // ✅ STATISTIQUES INSTRUCTEUR - NOUVEAU
  // =======================
  static getInstructorStats = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const instructorId = InscriptionController.getUserId(req);
      
      const stats = await InscriptionService.getInstructorStats(instructorId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (err) {
      console.error('Erreur dans getInstructorStats:', err);
      next(err);
    }
  };

  // =======================
  // ✅ RÉCUPÉRER UNE INSCRIPTION SPÉCIFIQUE
  // =======================
  static getEnrollmentById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = InscriptionController.getUserId(req);
      const { id } = req.params;

      console.log('Récupération inscription spécifique:', { id, userId });

      if (!id) throw createError(400, 'ID manquant dans la requête');
      if (!Types.ObjectId.isValid(id)) {
        throw createError(400, 'Identifiant d\'inscription invalide');
      }

      const inscription = await InscriptionService.getEnrollmentById(id, userId);
      
      res.json({
        success: true,
        data: inscription
      });
    } catch (err) {
      console.error('Erreur dans getEnrollmentById:', err);
      next(err);
    }
  };

  // =======================
  // ✅ MISE À JOUR DU STATUT D'UNE INSCRIPTION
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

      console.log('Mise à jour statut:', { id, statut, userId });

      if (!id) throw createError(400, 'ID manquant dans la requête');
      if (!Types.ObjectId.isValid(id)) {
        throw createError(400, 'Identifiant d\'inscription invalide');
      }
      if (!Object.values(StatutInscription).includes(statut)) {
        throw createError(400, 'Statut d\'inscription invalide');
      }

      const inscription = await InscriptionService.updateStatus(id, statut, userId);
      res.json({ 
        success: true,
        message: 'Statut mis à jour avec succès',
        data: inscription 
      });
    } catch (err) {
      console.error('Erreur dans updateStatus:', err);
      next(err);
    }
  };

  // =======================
  // ✅ SUPPRESSION D'UNE INSCRIPTION
  // =======================
  static delete = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = InscriptionController.getUserId(req);
      const { id } = req.params;

      console.log('Suppression inscription:', { id, userId });

      if (!id) throw createError(400, 'ID manquant dans la requête');
      if (!Types.ObjectId.isValid(id)) {
        throw createError(400, 'Identifiant d\'inscription invalide');
      }

      const result = await InscriptionService.deleteEnrollment(id, userId);
      res.json({
        success: true,
        ...result
      });
    } catch (err) {
      console.error('Erreur dans delete:', err);
      next(err);
    }
  };

  // =======================
  // ✅ STATISTIQUES DES INSCRIPTIONS
  // =======================
  static getStats = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = InscriptionController.getUserId(req);
      const stats = await InscriptionService.getEnrollmentStats(userId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (err) {
      console.error('Erreur dans getStats:', err);
      next(err);
    }
  };

  // =======================
  // ✅ VÉRIFICATION D'INSCRIPTION À UN COURS
  // =======================
  static checkEnrollment = async (
    req: Request<{ coursId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = InscriptionController.getUserId(req);
      const { coursId } = req.params;

      if (!coursId || !Types.ObjectId.isValid(coursId)) {
        throw createError(400, 'Identifiant de cours invalide');
      }

      const isEnrolled = await InscriptionService.isUserEnrolled(userId, coursId);
      
      res.json({
        success: true,
        isEnrolled,
        message: isEnrolled ? 'Utilisateur inscrit au cours' : 'Utilisateur non inscrit au cours'
      });
    } catch (err) {
      console.error('Erreur dans checkEnrollment:', err);
      next(err);
    }
  };

  // =======================
  // ✅ MÉTHODE PRIVÉE POUR RÉCUPÉRER L'ID UTILISATEUR
  // =======================
  private static getUserId(req: Request): string {
    const user = (req as any).user;
    if (!user || !user._id) {
      throw createError(401, 'Non authentifié');
    }
    return user._id.toString();
  }
}

export default InscriptionController;