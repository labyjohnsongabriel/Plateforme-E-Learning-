import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { StatisticsService } from '../../services/report/StatisticsService';
import { UserService } from '../../services/user/UserService';
import { CoursService } from '../../services/learning/CoursService';
import { GlobalStats, UserStats, CourseStats, UserData, CourseData, UserDocument, CourseDocument } from '../../types';

/**
 * Contrôleur pour gérer les fonctionnalités administratives.
 */
class AdminController {
  /**
   * Récupère les statistiques globales du système.
   * @param req - Requête Express
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static getGlobalStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw createError(403, 'Accès réservé aux administrateurs');
      }
      const stats = await StatisticsService.getGlobalStats();
      res.json(stats);
    } catch (err) {
      console.error('Erreur controller getGlobalStats:', (err as Error).message);
      next(err);
    }
  };

  /**
   * Récupère les statistiques d'un utilisateur spécifique.
   * @param req - Requête Express avec paramètre userId
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static getUserStats = async (req: Request<{ userId: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw createError(403, 'Accès réservé aux administrateurs');
      }
      const stats = await StatisticsService.getUserStats(req.params.userId);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Récupère les statistiques d'un cours spécifique.
   * @param req - Requête Express avec paramètre coursId
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static getCourseStats = async (req: Request<{ coursId: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw createError(403, 'Accès réservé aux administrateurs');
      }
      const stats = await StatisticsService.getCourseStats(req.params.coursId);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Récupère tous les utilisateurs.
   * @param req - Requête Express
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw createError(403, 'Accès réservé aux administrateurs');
      }
      const users = await UserService.getAllUsers();
      res.json(users);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Met à jour un utilisateur.
   * @param req - Requête Express avec paramètre userId et corps
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static updateUser = async (req: Request<{ userId: string }, {}, UserData>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw createError(403, 'Accès réservé aux administrateurs');
      }
      const updated = await UserService.updateUser(req.params.userId, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Supprime un utilisateur.
   * @param req - Requête Express avec paramètre userId
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static deleteUser = async (req: Request<{ userId: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw createError(403, 'Accès réservé aux administrateurs');
      }
      await UserService.deleteUser(req.params.userId);
      res.json({ message: 'Utilisateur supprimé' });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Crée un nouveau cours.
   * @param req - Requête Express avec corps et utilisateur authentifié
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static createCourse = async (req: Request<{}, {}, CourseData>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw createError(403, 'Accès réservé aux administrateurs');
      }
      const course = await CoursService.createCourse(req.body, req.user.id);
      res.status(201).json(course);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Récupère tous les cours.
   * @param req - Requête Express
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static getAllCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw createError(403, 'Accès réservé aux administrateurs');
      }
      const courses = await CoursService.getAllCourses();
      res.json(courses);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Met à jour un cours.
   * @param req - Requête Express avec paramètre coursId et corps
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static updateCourse = async (req: Request<{ coursId: string }, {}, CourseData>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw createError(403, 'Accès réservé aux administrateurs');
      }
      const updated = await CoursService.updateCourse(req.params.coursId, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Supprime un cours.
   * @param req - Requête Express avec paramètre coursId
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static deleteCourse = async (req: Request<{ coursId: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw createError(403, 'Accès réservé aux administrateurs');
      }
      await CoursService.deleteCourse(req.params.coursId);
      res.json({ message: 'Cours supprimé' });
    } catch (err) {
      next(err);
    }
  };
}

export default AdministrateurController;