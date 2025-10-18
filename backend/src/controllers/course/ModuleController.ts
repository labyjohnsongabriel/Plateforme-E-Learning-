import { Request, Response, NextFunction } from 'express';
import { ModuleService } from '../../services/course/ModuleService';
import createError from 'http-errors';
import logger from '../../utils/logger';

class ModuleController {
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        throw createError(400, 'L’ID du module est requis');
      }
      const module = await ModuleService.getById(id);
      res.json({ data: module });
    } catch (error) {
      logger.error('Error fetching module:', {
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
      if (typeof courseId !== 'string') {
        throw createError(400, 'courseId doit être une chaîne de caractères');
      }
      const modules = await ModuleService.getByCourseId(courseId);
      res.json({ data: modules });
    } catch (error) {
      logger.error('Error fetching modules by course:', {
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
      const module = await ModuleService.create(req.body, userId);
      res.status(201).json({ data: module });
    } catch (error) {
      logger.error('Error creating module:', {
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
      if (!id) {
        throw createError(400, 'L’ID du module est requis');
      }
      if (!userId) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const module = await ModuleService.update(id, req.body, userId);
      res.json({ data: module });
    } catch (error) {
      logger.error('Error updating module:', {
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
      if (!id) {
        throw createError(400, 'L’ID du module est requis');
      }
      if (!userId) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      await ModuleService.delete(id, userId);
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting module:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        moduleId: req.params.id,
      });
      next(error);
    }
  }
}

export default ModuleController;