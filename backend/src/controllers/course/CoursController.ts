// src/controllers/course/CoursController.ts - CORRIGÉ
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
  // FONCTION HELPER POUR VALIDER ET NETTOYER LE CONTENU DU COURS
  private static validateAndCleanCourseContent(contenu: any): any {
    if (!contenu || !contenu.sections || !Array.isArray(contenu.sections)) {
      return contenu;
    }

    const cleanedSections = contenu.sections.map((section: any, sectionIndex: number) => {
      if (!section || typeof section !== 'object') {
        return { 
          titre: `Section ${sectionIndex + 1}`, 
          modules: [], 
          ordre: sectionIndex + 1 
        };
      }

      const modules = Array.isArray(section.modules) ? section.modules : [];

      const cleanedModules = modules.map((module: any, moduleIndex: number) => {
        // Créer un objet module nettoyé
        const cleanedModule: any = {
          titre: module.titre ? module.titre.toString().trim() : `Module ${moduleIndex + 1}`,
          type: 'DOCUMENT', // Valeur par défaut
          duree: 5, // Valeur par défaut
          ordre: module.ordre || moduleIndex + 1,
          contenu: module.contenu ? module.contenu.toString().trim() : '',
          description: module.description ? module.description.toString().trim() : ''
        };

        // Gestion du type - conversion en MAJUSCULES
        if (module.type) {
          const type = module.type.toString().toUpperCase();
          const validTypes = ['VIDEO', 'DOCUMENT', 'QUIZ', 'EXERCICE'];
          cleanedModule.type = validTypes.includes(type) ? type : 'DOCUMENT';
        }

        // Gestion de la durée
        if (module.duree !== null && module.duree !== undefined && module.duree !== '') {
          const dureeNum = Number(module.duree);
          if (!isNaN(dureeNum) && dureeNum > 0) {
            cleanedModule.duree = dureeNum;
          }
        }

        // Conserver les métadonnées des fichiers
        if (module.metadata && typeof module.metadata === 'object') {
          cleanedModule.metadata = module.metadata;
        }

        // URL du fichier (important pour les contenus)
        if (module.url) {
          cleanedModule.url = module.url.toString().trim();
        } else if (module.contenu) {
          // Si pas d'URL mais un contenu textuel, on le considère comme URL
          cleanedModule.url = module.contenu.toString().trim();
        }

        logger.debug(`Module nettoyé: ${cleanedModule.titre}, type: ${cleanedModule.type}, durée: ${cleanedModule.duree}min`);
        
        return cleanedModule;
      });

      return {
        titre: section.titre ? section.titre.toString().trim() : `Section ${sectionIndex + 1}`,
        description: section.description ? section.description.toString().trim() : '',
        ordre: section.ordre || sectionIndex + 1,
        modules: cleanedModules
      };
    });

    return {
      ...contenu,
      sections: cleanedSections
    };
  }

  static async create(data: CourseData, createurId: string): Promise<CourseDocument> {
    try {
      // Validation des champs requis
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

      // VALIDATION ET NETTOYAGE DU CONTENU
      let cleanedContenu = data.contenu;
      if (data.contenu) {
        try {
          cleanedContenu = this.validateAndCleanCourseContent(data.contenu);
          logger.info('Contenu du cours validé et nettoyé avec succès');
        } catch (validationError) {
          logger.warn('Erreur lors de la validation du contenu, utilisation du contenu original:', validationError);
          // On continue avec le contenu original en cas d'erreur de validation
        }
      }

      // Validation de la durée
      const courseDuree = Number(data.duree);
      if (isNaN(courseDuree) || courseDuree <= 0) {
        throw createError(400, 'La durée du cours doit être un nombre supérieur à 0');
      }

      const cours = new Cours({
        ...data,
        contenu: cleanedContenu,
        createur: createurId,
        domaineId: data.domaineId,
        duree: courseDuree,
      });

      await cours.save();

      // Lier le cours au domaine
      try {
        await Domaine.findByIdAndUpdate(data.domaineId, {
          $push: { cours: cours._id },
        });
        logger.info(`Cours ${cours._id} lié au domaine ${data.domaineId}`);
      } catch (linkErr) {
        logger.warn(`Échec de liaison au domaine: ${(linkErr as Error).message}`);
      }

      logger.info(`Cours créé avec succès: ${cours._id}`);
      return await this.getById(cours._id.toString());
    } catch (err) {
      logger.error(`Échec de création du cours: ${(err as Error).message}`);
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
      logger.error(`Échec de récupération des cours: ${(err as Error).message}`);
      throw createError(500, 'Erreur serveur lors de la récupération des cours');
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
      logger.error(`Échec de récupération des cours publics: ${(err as Error).message}`);
      throw createError(500, 'Erreur serveur lors de la récupération des cours publics');
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
      
      return { 
        total, 
        published, 
        draft, 
        pending, 
        approved, 
        rejected 
      };
    } catch (err) {
      logger.error(`Échec de récupération des statistiques: ${(err as Error).message}`);
      throw createError(500, 'Erreur serveur lors de la récupération des statistiques');
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

      // Calcul de la progression pour chaque cours
      for (const course of courses) {
        const progression = await Progression.findOne({ 
          user: userId, 
          cours: course._id 
        });
        (course as any).progression = progression ? progression.pourcentage : 0;
      }

      return {
        data: courses as unknown as CourseDocument[],
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (err) {
      logger.error(`Échec de récupération des cours de l'utilisateur: ${(err as Error).message}`);
      throw createError(500, 'Erreur serveur lors de la récupération de vos cours');
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
      logger.error(`Échec de récupération du cours ${id}: ${(err as Error).message}`);
      throw err;
    }
  }

  static async update(id: string, data: Partial<CourseData>): Promise<CourseDocument> {
    try {
      const currentCourse = await Cours.findById(id);
      if (!currentCourse) throw createError(404, 'Cours non trouvé');

      // Validation du domaine
      if (data.domaineId) {
        if (!mongoose.Types.ObjectId.isValid(data.domaineId)) {
          throw createError(400, 'Domaine ID invalide');
        }

        const domaineExists = await Domaine.findById(data.domaineId);
        if (!domaineExists) throw createError(400, 'Domaine non trouvé');
      }

      // Validation du niveau
      if (data.niveau) {
        const validLevels = ['ALFA', 'BETA', 'GAMMA', 'DELTA'];
        if (!validLevels.includes(data.niveau)) {
          throw createError(400, `Niveau invalide: ${validLevels.join(', ')}`);
        }
      }

      // VALIDATION ET NETTOYAGE DU CONTENU
      if (data.contenu) {
        try {
          data.contenu = this.validateAndCleanCourseContent(data.contenu);
          logger.info('Contenu du cours validé et nettoyé pour la mise à jour');
        } catch (validationError) {
          logger.warn('Erreur lors de la validation du contenu pour mise à jour:', validationError);
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

      // Mise à jour des liens de domaine si nécessaire
      if (oldDomaineId) {
        await Domaine.findByIdAndUpdate(oldDomaineId, { $pull: { cours: id } });
        await Domaine.findByIdAndUpdate(data.domaineId, { $push: { cours: id } });
      }

      return await this.getById(id);
    } catch (err) {
      logger.error(`Échec de mise à jour du cours ${id}: ${(err as Error).message}`);
      throw err;
    }
  }

  static async delete(id: string): Promise<CourseDocument> {
    try {
      const cours = await Cours.findByIdAndDelete(id).lean();
      if (!cours) throw createError(404, 'Cours non trouvé');

      // Nettoyage des données associées
      await Promise.all([
        Contenu.deleteMany({ cours: id }),
        Quiz.deleteMany({ cours: id }),
        Progression.deleteMany({ cours: id })
      ]);

      // Retirer le cours du domaine
      await Domaine.findByIdAndUpdate(cours.domaineId, { $pull: { cours: id } });

      logger.info(`Cours ${id} supprimé avec succès`);
      return cours as unknown as CourseDocument;
    } catch (err) {
      logger.error(`Échec de suppression du cours ${id}: ${(err as Error).message}`);
      throw err;
    }
  }
}

class CoursController {
  static async create(req: Request<{}, {}, CourseData>, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) throw createError(401, 'Utilisateur non authentifié');
      
      logger.info('Création d\'un nouveau cours', { 
        userId: req.user.id,
        data: {
          titre: req.body.titre,
          domaineId: req.body.domaineId,
          niveau: req.body.niveau
        }
      });
      
      const cours = await CoursService.create(req.body, req.user.id);
      
      res.status(201).json({
        success: true,
        data: cours,
        message: 'Cours créé avec succès'
      });
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
      
      res.json({
        success: true,
        ...result,
        message: 'Cours récupérés avec succès'
      });
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
      
      res.json({
        success: true,
        ...result,
        message: 'Cours publics récupérés avec succès'
      });
    } catch (err) {
      next(err);
    }
  }

  static async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await CoursService.getStats();
      
      res.json({
        success: true,
        data: stats,
        message: 'Statistiques récupérées avec succès'
      });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const cours = await CoursService.getById(req.params.id);
      
      res.json({
        success: true,
        data: cours,
        message: 'Cours récupéré avec succès'
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request<{ id: string }, {}, Partial<CourseData>>, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Mise à jour du cours', { 
        courseId: req.params.id,
        updates: Object.keys(req.body)
      });
      
      const cours = await CoursService.update(req.params.id, req.body);
      
      res.json({
        success: true,
        data: cours,
        message: 'Cours mis à jour avec succès'
      });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Suppression du cours', { courseId: req.params.id });
      
      const cours = await CoursService.delete(req.params.id);
      
      res.json({
        success: true,
        data: cours,
        message: 'Cours supprimé avec succès'
      });
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
      if (!req.user?.id) throw createError(401, 'Utilisateur non authentifié');
      
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '10', 10);
      
      const result = await CoursService.getMyCourses(req.user.id, page, limit);
      
      res.json({
        success: true,
        ...result,
        message: 'Vos cours récupérés avec succès'
      });
    } catch (err) {
      next(err);
    }
  }
}

export default CoursController;