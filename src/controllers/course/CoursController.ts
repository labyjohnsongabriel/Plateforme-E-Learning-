import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import mongoose from 'mongoose';
import { Cours } from '../../models/course/Cours';
import { Domaine } from '../../models/course/Domaine';
import { Contenu } from '../../models/course/Contenu';
import { Quiz } from '../../models/course/Quiz';
import logger from '../../utils/logger';
import { CourseDocument, CourseData, CourseResponse } from '../../types';

class CoursService {
  static async create(data: CourseData, createurId: string): Promise<CourseDocument> {
    try {
      // Verify domaineId exists
      const domaine = await Domaine.findById(data.domaineId);
      if (!domaine) {
        throw createError(400, 'Domaine non trouvé');
      }

      const cours = new Cours({
        ...data,
        createur: createurId,
        domaineId: data.domaineId,
      });
      await cours.save();
      // Add course to domaine
      await Domaine.findByIdAndUpdate(data.domaineId, {
        $push: { cours: cours._id },
      });
      return cours;
    } catch (err) {
      logger.error(`Error creating course: ${(err as Error).message}`);
      throw err;
    }
  }

  static async getAll(page: number = 1, limit: number = 10): Promise<CourseResponse> {
    try {
      const courses = await Cours.find()
        .populate('domaineId')
        .limit(limit)
        .skip((page - 1) * limit)
        .lean();
      const total = await Cours.countDocuments();
      return {
        data: courses as CourseDocument[],
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (err) {
      logger.error(`Error fetching courses: ${(err as Error).message}`);
      throw createError(500, `Error fetching courses: ${(err as Error).message}`);
    }
  }

  static async getById(id: string): Promise<CourseDocument> {
    try {
      const cours = await Cours.findById(id).populate('domaineId').lean();
      if (!cours) {
        throw createError(404, 'Cours non trouvé');
      }
      return cours as CourseDocument;
    } catch (err) {
      logger.error(`Error fetching course by ID: ${(err as Error).message}`);
      throw err;
    }
  }

  static async update(id: string, data: Partial<CourseData>): Promise<CourseDocument> {
    try {
      // Verify domaineId exists if provided
      if (data.domaineId) {
        const domaine = await Domaine.findById(data.domaineId);
        if (!domaine) {
          throw createError(400, 'Domaine non trouvé');
        }
      }

      const cours = await Cours.findByIdAndUpdate(
        id,
        { ...data, domaineId: data.domaineId },
        { new: true, runValidators: true }
      );
      if (!cours) {
        throw createError(404, 'Cours non trouvé');
      }
      return cours;
    } catch (err) {
      logger.error(`Error updating course: ${(err as Error).message}`);
      throw err;
    }
  }

  static async delete(id: string): Promise<CourseDocument> {
    try {
      const cours = await Cours.findByIdAndDelete(id);
      if (!cours) {
        throw createError(404, 'Cours non trouvé');
      }
      // Delete associated contenus and quizzes
      await Contenu.deleteMany({ cours: id });
      await Quiz.deleteMany({ cours: id });
      // Remove course from domaine
      await Domaine.findByIdAndUpdate(cours.domaineId, {
        $pull: { cours: id },
      });
      return cours;
    } catch (err) {
      logger.error(`Error deleting course: ${(err as Error).message}`);
      throw err;
    }
  }
}

class CoursController {
  static create = async (req: Request<{}, {}, CourseData>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const cours = await CoursService.create(req.body, req.user.id);
      res.status(201).json(cours);
    } catch (err) {
      next(err);
    }
  };

  static getAll = async (req: Request<{}, {}, {}, { page?: string; limit?: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '10', 10);
      const cours = await CoursService.getAll(page, limit);
      res.json(cours);
    } catch (err) {
      next(err);
    }
  };

  static getById = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cours = await CoursService.getById(req.params.id);
      res.json(cours);
    } catch (err) {
      next(err);
    }
  };

  static update = async (req: Request<{ id: string }, {}, Partial<CourseData>>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cours = await CoursService.update(req.params.id, req.body);
      res.json(cours);
    } catch (err) {
      next(err);
    }
  };

  static delete = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cours = await CoursService.delete(req.params.id);
      res.json({ message: 'Cours supprimé', cours });
    } catch (err) {
      next(err);
    }
  };
}

export default CoursController;