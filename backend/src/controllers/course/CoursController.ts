// src/controllers/course/CoursController.ts
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import mongoose from 'mongoose';
import Cours from '../../models/course/Cours';
import Domaine from '../../models/course/Domaine';
import Contenu from '../../models/course/Contenu';
import Quiz from '../../models/course/Quiz';
import logger from '../../utils/logger';
import { CourseDocument, CourseData, CourseResponse } from '../../types';
import Progression from '../../models/learning/Progression';

class CoursService {
  static async create(data: CourseData, createurId: string): Promise<CourseDocument> {
    try {
      // Plus de 'domaine' → uniquement domaineId
      if (!data.titre || !data.description || !data.domaineId || !data.niveau || !data.duree) {
        throw createError(400, 'Champs requis manquants: titre, description, domaineId, niveau, duree');
      }

      if (!mongoose.Types.ObjectId.isValid(data.domaineId)) {
        throw createError(400, 'Domaine ID invalide');
      }

      const domaineExists = await Domaine.findById(data.domaineId);
      if (!domaineExists) {
        throw createError(400, 'Domaine non trouvé');
      }

      const validLevels = ['ALFA', 'BETA', 'GAMMA', 'DELTA'];
      if (!validLevels.includes(data.niveau)) {
        throw createError(400, `Niveau invalide: ${validLevels.join(', ')}`);
      }

      const cours = new Cours({
        ...data,
        createur: createurId,
        domaineId: data.domaineId,
      });

      await cours.save();

      try {
        await Domaine.findByIdAndUpdate(data.domaineId, {
          $push: { cours: cours._id },
        });
      } catch (linkErr) {
        logger.warn(`Lien domaine échoué: ${(linkErr as Error).message}`);
      }

      logger.info(`Cours créé: ${cours._id}`);
      return await this.getById(cours._id.toString());
    } catch (err) {
      logger.error(`Création échouée: ${(err as Error).message}`);
      throw err;
    }
  }

  static async getAll(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    statusFilter: string = 'ALL',
    approvalFilter: string = 'ALL'
  ): Promise<CourseResponse> {
    try {
      const pipeline: any[] = [
        {
          $lookup: {
            from: 'domaines',
            localField: 'domaineId',
            foreignField: '_id',
            as: 'domaineId',
          },
        },
        { $unwind: { path: '$domaineId', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'users',
            localField: 'createur',
            foreignField: '_id',
            as: 'createur',
          },
        },
        { $unwind: { path: '$createur', preserveNullAndEmptyArrays: true } },
      ];

      const match: any = {};

      if (search) {
        match.$or = [
          { titre: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { 'domaineId.nom': { $regex: search, $options: 'i' } },
        ];
      }

      if (statusFilter !== 'ALL') {
        match.estPublie = statusFilter === 'PUBLISHED';
      }

      if (approvalFilter !== 'ALL') {
        match.statutApprobation = approvalFilter;
      }

      if (Object.keys(match).length > 0) {
        pipeline.push({ $match: match });
      }

      const countPipeline = [...pipeline, { $count: 'total' }];
      const countResult = await Cours.aggregate(countPipeline);
      const total = countResult[0]?.total || 0;

      pipeline.push({ $skip: (page - 1) * limit });
      pipeline.push({ $limit: limit });
      pipeline.push({ $sort: { createdAt: -1 } });

      const courses = await Cours.aggregate(pipeline);

      return {
        data: courses as unknown as CourseDocument[],
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (err) {
      logger.error(`Récupération échouée: ${(err as Error).message}`);
      throw createError(500, 'Erreur serveur');
    }
  }

  static async getPublicCourses(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    level: string = 'all',
    domain: string = 'all'
  ): Promise<CourseResponse> {
    try {
      const pipeline: any[] = [
        {
          $match: {
            estPublie: true,
            statutApprobation: 'APPROVED',
          },
        },
        {
          $lookup: {
            from: 'domaines',
            localField: 'domaineId',
            foreignField: '_id',
            as: 'domaineId',
          },
        },
        { $unwind: { path: '$domaineId', preserveNullAndEmptyArrays: true } },
      ];

      if (search) {
        pipeline.push({
          $match: {
            $or: [
              { titre: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
              { 'domaineId.nom': { $regex: search, $options: 'i' } },
            ],
          },
        });
      }

      if (level !== 'all') {
        pipeline.push({ $match: { niveau: level.toUpperCase() } });
      }

      if (domain !== 'all') {
        if (!mongoose.Types.ObjectId.isValid(domain)) {
          throw createError(400, 'Domaine ID invalide');
        }
        pipeline.push({ $match: { 'domaineId._id': new mongoose.Types.ObjectId(domain) } });
      }

      const countPipeline = [...pipeline, { $count: 'total' }];
      const countResult = await Cours.aggregate(countPipeline);
      const total = countResult[0]?.total || 0;

      pipeline.push({ $skip: (page - 1) * limit });
      pipeline.push({ $limit: limit });
      pipeline.push({ $sort: { createdAt: -1 } });

      const courses = await Cours.aggregate(pipeline);

      return {
        data: courses as unknown as CourseDocument[],
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (err) {
      logger.error(`Cours publics échoués: ${(err as Error).message}`);
      throw createError(500, 'Erreur serveur');
    }
  }

  static async getStats(): Promise<any> {
    try {
      const total = await Cours.countDocuments();
      const published = await Cours.countDocuments({ estPublie: true });
      const draft = total - published;
      const pending = await Cours.countDocuments({ statutApprobation: 'PENDING' });
      const approved = await Cours.countDocuments({ statutApprobation: 'APPROVED' });
      const rejected = await Cours.countDocuments({ statutApprobation: 'REJECTED' });
      return { total, published, draft, pending, approved, rejected };
    } catch (err) {
      logger.error(`Stats échouées: ${(err as Error).message}`);
      throw createError(500, 'Erreur serveur');
    }
  }

  static async getMyCourses(userId: string, page: number = 1, limit: number = 10): Promise<CourseResponse> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw createError(400, 'ID utilisateur invalide');
      }

      const courses = await Cours.find({ etudiants: userId })
        .populate('domaineId', 'nom')
        .populate('instructeurId', 'prenom nom')
        .populate('createur', 'prenom nom')
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .lean();

      const total = await Cours.countDocuments({ etudiants: userId });

      for (const course of courses) {
        const progression = await Progression.findOne({ user: userId, cours: course._id });
        (course as any).progression = progression ? progression.pourcentage : 0;
      }

      return {
        data: courses as unknown as CourseDocument[],
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (err) {
      logger.error(`Mes cours échoués: ${(err as Error).message}`);
      throw createError(500, 'Erreur serveur');
    }
  }

  static async getById(id: string): Promise<CourseDocument> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw createError(400, 'ID de cours invalide');
      }

      const cours = await Cours.findById(id)
        .populate('domaineId')
        .populate('instructeurId')
        .populate('createur')
        .lean();

      if (!cours) throw createError(404, 'Cours non trouvé');

      return cours as unknown as CourseDocument;
    } catch (err) {
      logger.error(`Récupération échouée: ${(err as Error).message}`);
      throw err;
    }
  }

  static async update(id: string, data: Partial<CourseData>): Promise<CourseDocument> {
    try {
      const currentCourse = await Cours.findById(id);
      if (!currentCourse) throw createError(404, 'Cours non trouvé');

      // Plus de 'domaine' → uniquement domaineId
      if (data.domaineId) {
        if (!mongoose.Types.ObjectId.isValid(data.domaineId)) {
          throw createError(400, 'Domaine ID invalide');
        }

        const domaineExists = await Domaine.findById(data.domaineId);
        if (!domaineExists) throw createError(400, 'Domaine non trouvé');
      }

      if (data.niveau) {
        const validLevels = ['ALFA', 'BETA', 'GAMMA', 'DELTA'];
        if (!validLevels.includes(data.niveau)) {
          throw createError(400, `Niveau invalide: ${validLevels.join(', ')}`);
        }
      }

      let oldDomaineId: mongoose.Types.ObjectId | undefined;
      if (data.domaineId && data.domaineId.toString() !== currentCourse.domaineId.toString()) {
        oldDomaineId = currentCourse.domaineId;
      }

      const updated = await Cours.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
      ).lean();

      if (!updated) throw createError(404, 'Cours non trouvé après mise à jour');

      if (oldDomaineId) {
        await Domaine.findByIdAndUpdate(oldDomaineId, { $pull: { cours: id } });
        await Domaine.findByIdAndUpdate(data.domaineId, { $push: { cours: id } });
      }

      return await this.getById(id);
    } catch (err) {
      logger.error(`Mise à jour échouée: ${(err as Error).message}`);
      throw err;
    }
  }

  static async delete(id: string): Promise<CourseDocument> {
    try {
      const cours = await Cours.findByIdAndDelete(id).lean();
      if (!cours) throw createError(404, 'Cours non trouvé');

      await Contenu.deleteMany({ cours: id });
      await Quiz.deleteMany({ cours: id });
      await Progression.deleteMany({ cours: id });

      await Domaine.findByIdAndUpdate(cours.domaineId, { $pull: { cours: id } });

      return cours as unknown as CourseDocument;
    } catch (err) {
      logger.error(`Suppression échouée: ${(err as Error).message}`);
      throw err;
    }
  }
}

class CoursController {
  static async create(req: Request<{}, {}, CourseData>, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) throw createError(401, 'Non authentifié');
      const cours = await CoursService.create(req.body, req.user.id);
      res.status(201).json(cours);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(
    req: Request<{}, {}, {}, { page?: string; limit?: string; search?: string; statusFilter?: string; approvalFilter?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '10', 10);
      const search = req.query.search || '';
      const statusFilter = req.query.statusFilter || 'ALL';
      const approvalFilter = req.query.approvalFilter || 'ALL';
      const result = await CoursService.getAll(page, limit, search, statusFilter, approvalFilter);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getPublicCourses(
    req: Request<{}, {}, {}, { page?: string; limit?: string; search?: string; level?: string; domain?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '10', 10);
      const search = req.query.search || '';
      const level = req.query.level || 'all';
      const domain = req.query.domain || 'all';
      const result = await CoursService.getPublicCourses(page, limit, search, level, domain);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await CoursService.getStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const cours = await CoursService.getById(req.params.id);
      res.json(cours);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request<{ id: string }, {}, Partial<CourseData>>, res: Response, next: NextFunction): Promise<void> {
    try {
      const cours = await CoursService.update(req.params.id, req.body);
      res.json(cours);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const cours = await CoursService.delete(req.params.id);
      res.json({ message: 'Cours supprimé', cours });
    } catch (err) {
      next(err);
    }
  }

  static async getMyCourses(
    req: Request<{}, {}, {}, { page?: string; limit?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.id) throw createError(401, 'Non authentifié');
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '10', 10);
      const result = await CoursService.getMyCourses(req.user.id, page, limit);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export default CoursController;