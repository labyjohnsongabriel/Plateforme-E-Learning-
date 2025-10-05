// src/controllers/user/AdministrateurController.ts
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import StatisticsService from '../../services/report/StatisticsService';
import UserService from '../../services/user/UserService';
import CoursService from '../../services/learning/CoursService';
import { GlobalStats, UserStats, CourseStats, UserData, CourseCreateData, CourseUpdateData } from '../../types';
import { RoleUtilisateur } from '../../types';

/**
 * Contrôleur pour gérer les fonctionnalités administratives.
 */
class AdministrateurController {
  /**
   * Récupère les statistiques globales du système.
   */
  static getGlobalStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || req.user.role !== RoleUtilisateur.ADMIN) {
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
   */
  static getUserStats = async (req: Request<{ userId: string }>, res: Response, next: NextFunction): Promise<void> => {
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

  /**
   * Récupère les statistiques d'un cours spécifique.
   */
  static getCourseStats = async (req: Request<{ coursId: string }>, res: Response, next: NextFunction): Promise<void> => {
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

  /**
   * Récupère tous les utilisateurs.
   */
  static getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

  /**
   * Met à jour un utilisateur.
   */
  static updateUser = async (req: Request<{ userId: string }, {}, UserData>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || req.user.role !== RoleUtilisateur.ADMIN) {
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
   */
  static deleteUser = async (req: Request<{ userId: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || req.user.role !== RoleUtilisateur.ADMIN) {
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
   */
  static createCourse = async (req: Request<{}, {}, CourseCreateData>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || req.user.role !== RoleUtilisateur.ADMIN) {
        throw createError(403, 'Accès réservé aux administrateurs');
      }
      const { titre, description, duree, domaineId, niveau, contenus, quizzes } = req.body;
      if (!titre || !duree || !domaineId || !niveau) {
        throw createError(400, 'Les champs titre, duree, domaineId et niveau sont requis');
      }
      const course = await CoursService.createCourse(
        {
          titre,
          description: description ?? '',
          duree,
          domaineId,
          niveau,
          contenus: contenus ?? [],
          quizzes: quizzes ?? [],
          statutApprobation: 'APPROVED', // Les cours créés par un admin sont automatiquement approuvés
          estPublie: false,
        },
        req.user.id
      );
      res.status(201).json(course);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Récupère tous les cours.
   */
  static getAllCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

  /**
   * Met à jour un cours.
   */
  static updateCourse = async (req: Request<{ coursId: string }, {}, CourseUpdateData>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || req.user.role !== RoleUtilisateur.ADMIN) {
        throw createError(403, 'Accès réservé aux administrateurs');
      }
      const { coursId } = req.params;
      const { titre, description, duree, domaineId, niveau, contenus, quizzes, statutApprobation, estPublie } = req.body;
      const updateData: CourseUpdateData = {};
      if (titre !== undefined) updateData.titre = titre;
      if (description !== undefined) updateData.description = description;
      if (duree !== undefined) updateData.duree = duree;
      if (domaineId !== undefined) updateData.domaineId = domaineId;
      if (niveau !== undefined) updateData.niveau = niveau;
      if (contenus !== undefined) updateData.contenus = contenus;
      if (quizzes !== undefined) updateData.quizzes = quizzes;
      if (statutApprobation !== undefined) updateData.statutApprobation = statutApprobation;
      if (estPublie !== undefined) updateData.estPublie = estPublie;
      const updated = await CoursService.updateCourse(coursId, updateData);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Supprime un cours.
   */
  static deleteCourse = async (req: Request<{ coursId: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || req.user.role !== RoleUtilisateur.ADMIN) {
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