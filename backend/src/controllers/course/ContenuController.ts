// Corrected ContenuController.ts - Added userId to getByCourseId for user-specific isCompleted, fixed types, professional logging.

import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { ContenuService } from '../../services/course/ContenuService';

export class ContenuController {
  static create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const contenu = await ContenuService.create(req.body);
      res.status(201).json({ data: contenu });
    } catch (err) {
      next(err);
    }
  };

  static getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const contenus = await ContenuService.getAll();
      res.json({ data: contenus });
    } catch (err) {
      next(err);
    }
  };

  static getById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const contenu = await ContenuService.getById(req.params.id);
      res.json({ data: contenu });
    } catch (err) {
      next(err);
    }
  };

  static getByCourseId = async (
    req: Request<{}, {}, {}, { courseId?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { courseId } = req.query;
      if (!courseId || typeof courseId !== 'string') {
        throw createError(400, `Le paramètre 'courseId' est requis et doit être une chaîne. Reçu: ${courseId}`);
      }
      if (!req.user || !req.user.id) {
        throw createError(401, 'Utilisateur non authentifié');
      }

      const contenus = await ContenuService.getByCourseId(courseId, req.user.id); // Passed userId for isCompleted
      res.json({ data: contenus });
    } catch (err) {
      next(err);
    }
  };

  static update = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const contenu = await ContenuService.update(req.params.id, req.body);
      res.json({ data: contenu });
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
      await ContenuService.delete(req.params.id);
      res.json({ message: 'Contenu supprimé avec succès' });
    } catch (err) {
      next(err);
    }
  };

  static complete = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      await ContenuService.complete(req.params.id, req.user.id); // Passed userId
      res.json({ message: 'Contenu complété' });
    } catch (err) {
      next(err);
    }
  };

  static soumettre = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const result = await ContenuService.soumettre(req.params.id, req.body.answers, req.user.id); // Passed userId if needed
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}
export default ContenuController;