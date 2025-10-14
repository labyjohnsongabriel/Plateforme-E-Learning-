import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import * as StatisticsService from '../../services/report/StatisticsService';
import * as UserService from '../../services/user/UserService';
import { CoursService } from '../../services/learning/CoursService';
import { RoleUtilisateur, CourseCreateData, CourseUpdateData, UserData, IUser } from '../../types';

/**
 * Contrôleur pour gérer les fonctionnalités administratives.
 */
class AdministrateurController {
  /** 🔹 Récupère les statistiques globales */
  static getGlobalStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== RoleUtilisateur.ADMIN) {
        throw createError(403, 'Accès réservé aux administrateurs');
      }

      const stats = await StatisticsService.getGlobalStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  };

  /** 🔹 Récupère les statistiques d’un utilisateur */
  static getUserStats = async (req: Request<{ userId: string }>, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== RoleUtilisateur.ADMIN) {
        throw createError(403, 'Accès réservé aux administrateurs');
      }

      const stats = await StatisticsService.getUserStats(req.params.userId);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  };

  /** 🔹 Récupère les statistiques d’un cours */
  static getCourseStats = async (req: Request<{ coursId: string }>, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== RoleUtilisateur.ADMIN) {
        throw createError(403, 'Accès réservé aux administrateurs');
      }

      const stats = await StatisticsService.getCourseStats(req.params.coursId);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  };

  /** 🔹 Liste tous les utilisateurs */
  static getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== RoleUtilisateur.ADMIN) {
        throw createError(403, 'Accès réservé aux administrateurs');
      }

      const users = await UserService.getAllUsers();
      res.json(users);
    } catch (err) {
      next(err);
    }
  };

  /** 🔹 Met à jour un utilisateur */
  static updateUser = async (
    req: Request<{ userId: string }, {}, UserData>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user || req.user.role !== RoleUtilisateur.ADMIN) {
        throw createError(403, 'Accès réservé aux administrateurs');
      }

      // ✅ Correction principale : cast explicite pour TypeScript
      const updated = await UserService.updateUser(req.params.userId, req.body as Partial<IUser>);

      res.json(updated);
    } catch (err) {
      next(err);
    }
  };

  /** 🔹 Supprime un utilisateur */
  static deleteUser = async (req: Request<{ userId: string }>, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== RoleUtilisateur.ADMIN) {
        throw createError(403, 'Accès réservé aux administrateurs');
      }

      await UserService.deleteUser(req.params.userId);
      res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (err) {
      next(err);
    }
  };

  /** 🔹 Crée un cours */
  static createCourse = async (
    req: Request<{}, {}, CourseCreateData>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user || req.user.role !== RoleUtilisateur.ADMIN) {
        throw createError(403, 'Accès réservé aux administrateurs');
      }

      const course = await CoursService.createCourse(req.body, req.user.id);
      res.status(201).json(course);
    } catch (err) {
      next(err);
    }
  };

  /** 🔹 Liste tous les cours */
  static getAllCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== RoleUtilisateur.ADMIN) {
        throw createError(403, 'Accès réservé aux administrateurs');
      }

      const courses = await CoursService.getAllCourses();
      res.json(courses);
    } catch (err) {
      next(err);
    }
  };

  /** 🔹 Récupère un cours par ID */
  static getCourseById = async (
    req: Request<{ coursId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user || req.user.role !== RoleUtilisateur.ADMIN) {
        throw createError(403, 'Accès réservé aux administrateurs');
      }

      const course = await CoursService.getCourseById(req.params.coursId);
      res.json(course);
    } catch (err) {
      next(err);
    }
  };

  /** 🔹 Met à jour un cours */
  static updateCourse = async (
    req: Request<{ coursId: string }, {}, CourseUpdateData>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user || req.user.role !== RoleUtilisateur.ADMIN) {
        throw createError(403, 'Accès réservé aux administrateurs');
      }

      const { coursId } = req.params;
      const updated = await CoursService.updateCourse(coursId, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  };

  /** 🔹 Supprime un cours */
  static deleteCourse = async (
    req: Request<{ coursId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user || req.user.role !== RoleUtilisateur.ADMIN) {
        throw createError(403, 'Accès réservé aux administrateurs');
      }

      await CoursService.deleteCourse(req.params.coursId);
      res.json({ message: 'Cours supprimé avec succès' });
    } catch (err) {
      next(err);
    }
  };
}

export default AdministrateurController;
