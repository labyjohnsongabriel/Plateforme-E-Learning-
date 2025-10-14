import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import mongoose from 'mongoose';
import Cours from '../../models/course/Cours';
import Domaine from '../../models/course/Domaine';
import Contenu from '../../models/course/Contenu';
import Quiz from '../../models/course/Quiz';
import logger from '../../utils/logger';
import { CourseDocument, CourseData, CourseResponse } from '../../types';

/**
 * ==============================
 * SERVICE : GESTION DES COURS
 * ==============================
 */
class CoursService {
  /** Créer un nouveau cours */
  static async create(data: CourseData, createurId: string): Promise<CourseDocument> {
    try {
      // Vérification du domaine
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

      // Lier le cours au domaine correspondant
      await Domaine.findByIdAndUpdate(data.domaineId, {
        $push: { cours: cours._id },
      });

      logger.info(`✅ Nouveau cours créé: ${cours._id}`);
      return cours as unknown as CourseDocument;
    } catch (err) {
      logger.error(`❌ Erreur lors de la création du cours: ${(err as Error).message}`);
      throw err;
    }
  }

  /** Récupérer tous les cours */
  static async getAll(page: number = 1, limit: number = 10): Promise<CourseResponse> {
    try {
      const courses = await Cours.find()
        .populate('domaineId')
        .limit(limit)
        .skip((page - 1) * limit)
        .lean();

      const total = await Cours.countDocuments();

      return {
        data: courses as unknown as CourseDocument[],
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (err) {
      logger.error(`❌ Erreur lors de la récupération des cours: ${(err as Error).message}`);
      throw createError(500, `Erreur serveur: ${(err as Error).message}`);
    }
  }

  /** Récupérer les cours d’un utilisateur */
  static async getMyCourses(userId: string, page: number = 1, limit: number = 10): Promise<CourseResponse> {
    try {
      // Validation de l'ID utilisateur
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        logger.warn(`⚠️ ID utilisateur invalide: ${userId}`);
        throw createError(400, 'ID utilisateur invalide');
      }

      logger.info(`📘 Récupération des cours pour l'utilisateur ${userId}`);

      const courses = await Cours.find({ etudiants: userId })
        .populate({
          path: 'domaineId',
          select: 'nom',
          options: { strictPopulate: false },
        })
        .populate({
          path: 'instructeurId',
          select: 'prenom nom',
          options: { strictPopulate: false },
        })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean();

      const total = await Cours.countDocuments({ etudiants: userId });

      return {
        data: courses as unknown as CourseDocument[],
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (err) {
      logger.error(`❌ Erreur lors de la récupération des cours de l'utilisateur ${userId}: ${(err as Error).message}`, {
        stack: (err as Error).stack,
      });
      throw createError((err as any).status || 500, (err as Error).message || 'Erreur serveur');
    }
  }

  /** Récupérer un cours par son ID */
  static async getById(id: string): Promise<CourseDocument> {
    try {
      // Vérification de l'ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        logger.warn(`⚠️ ID de cours invalide reçu: ${id}`);
        throw createError(400, 'ID de cours invalide');
      }

      const cours = await Cours.findById(id)
        .populate('domaineId')
        .populate('instructeurId')
        .populate('createur')
        .lean();

      if (!cours) {
        throw createError(404, 'Cours non trouvé');
      }

      logger.info(`✅ Cours trouvé: ${cours._id}`);
      return cours as unknown as CourseDocument;
    } catch (err) {
      logger.error(`❌ Erreur lors de la récupération du cours: ${(err as Error).message}`);
      throw err;
    }
  }

  /** Mettre à jour un cours */
  static async update(id: string, data: Partial<CourseData>): Promise<CourseDocument> {
    try {
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
      ).lean();

      if (!cours) {
        throw createError(404, 'Cours non trouvé');
      }

      logger.info(`✏️ Cours mis à jour: ${cours._id}`);
      return cours as unknown as CourseDocument;
    } catch (err) {
      logger.error(`❌ Erreur lors de la mise à jour du cours: ${(err as Error).message}`);
      throw err;
    }
  }

  /** Supprimer un cours */
  static async delete(id: string): Promise<CourseDocument> {
    try {
      const cours = await Cours.findByIdAndDelete(id).lean();

      if (!cours) {
        throw createError(404, 'Cours non trouvé');
      }

      await Contenu.deleteMany({ cours: id });
      await Quiz.deleteMany({ cours: id });
      await Domaine.findByIdAndUpdate(cours.domaineId, { $pull: { cours: id } });

      logger.info(`🗑️ Cours supprimé: ${cours._id}`);
      return cours as unknown as CourseDocument;
    } catch (err) {
      logger.error(`❌ Erreur lors de la suppression du cours: ${(err as Error).message}`);
      throw err;
    }
  }
}

/**
 * ==============================
 * CONTROLLER EXPRESS
 * ==============================
 */
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

  static getMyCourses = async (
    req: Request<{}, {}, {}, { page?: string; limit?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '10', 10);
      const courses = await CoursService.getMyCourses(req.user.id, page, limit);
      res.json(courses);
    } catch (err) {
      next(err);
    }
  };
}

export default CoursController;
