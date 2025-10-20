import { Request, Response, NextFunction } from 'express';
import ModuleService from '../../services/course/ModuleService';
import createError from 'http-errors';
import logger from '../../utils/logger';
import { Types } from 'mongoose';

// Interface pour typage de req.body
interface ModuleData {
  titre: string;
  url: string;
  ordre: number;
  coursId: string;
  description?: string;
  duree?: number;
  type: 'VIDEO' | 'DOCUMENT' | 'QUIZ' | 'EXERCICE';
}

class ModuleController {
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || !Types.ObjectId.isValid(id)) {
        throw createError(400, 'ID du module invalide');
      }
      const module = await ModuleService.getById(id);
      res.json({ data: module });
    } catch (error) {
      logger.error('Erreur lors de la récupération du module:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        moduleId: req.params.id,
      });
      next(error);
    }
  }

  static async getByCourseId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.query;
      if (!courseId || typeof courseId !== 'string' || !Types.ObjectId.isValid(courseId)) {
        throw createError(400, 'ID du cours invalide');
      }
      const modules = await ModuleService.getByCourseId(courseId);
      res.json({ data: modules });
    } catch (error) {
      logger.error('Erreur lors de la récupération des modules par cours:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        courseId: req.query.courseId,
      });
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const data: ModuleData = req.body;
      if (!data.titre || !data.url || !data.ordre || !data.coursId || !data.type) {
        throw createError(400, 'Champs requis manquants: titre, url, ordre, coursId, type');
      }
      if (!Types.ObjectId.isValid(data.coursId)) {
        throw createError(400, 'ID du cours invalide');
      }
      const module = await ModuleService.create(data, { id: userId, role: req.user?.role || '' });
      res.status(201).json({ data: module });
    } catch (error) {
      logger.error('Erreur lors de la création du module:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
      });
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!id || !Types.ObjectId.isValid(id)) {
        throw createError(400, 'ID du module invalide');
      }
      if (!userId) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const data: Partial<ModuleData> = req.body;
      const module = await ModuleService.update(id, data, { id: userId, role: req.user?.role || '' });
      res.json({ data: module });
    } catch (error) {
      logger.error('Erreur lors de la mise à jour du module:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        moduleId: req.params.id,
      });
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!id || !Types.ObjectId.isValid(id)) {
        throw createError(400, 'ID du module invalide');
      }
      if (!userId) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      await ModuleService.delete(id, { id: userId, role: req.user?.role || '' });
      res.status(204).send();
    } catch (error) {
      logger.error('Erreur lors de la suppression du module:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        moduleId: req.params.id,
      });
      next(error);
    }
  }
}

export default ModuleController;