import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import mongoose, { Types } from 'mongoose';
import Domaine from '../../models/course/Domaine';
import Cours from '../../models/course/Cours';
import logger from '../../utils/logger';
import { DomaineDocument, DomaineData } from '../../types';

class DomaineService {
  static async create(data: DomaineData): Promise<DomaineDocument> {
    try {
      const domaine = new Domaine(data);
      await domaine.save();
      return domaine.toObject() as DomaineDocument;
    } catch (err) {
      logger.error(`Erreur lors de la création du domaine : ${(err as Error).message}`);
      throw err;
    }
  }

  static async getAll(): Promise<DomaineDocument[]> {
    try {
      const domaines = await Domaine.find().exec();
      return domaines.map((doc) => doc.toObject() as DomaineDocument);
    } catch (err) {
      logger.error(`Erreur lors de la récupération des domaines : ${(err as Error).message}`);
      throw err;
    }
  }

  static async getById(id: string): Promise<DomaineDocument> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw createError(400, 'ID invalide');
      }
      const domaine = await Domaine.findById(id).exec();
      if (!domaine) {
        throw createError(404, 'Domaine non trouvé');
      }
      return domaine.toObject() as DomaineDocument;
    } catch (err) {
      logger.error(`Erreur lors de la récupération du domaine : ${(err as Error).message}`);
      throw err;
    }
  }

  static async update(id: string, data: Partial<DomaineData>): Promise<DomaineDocument> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw createError(400, 'ID invalide');
      }
      const domaine = await Domaine.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      }).exec();
      if (!domaine) {
        throw createError(404, 'Domaine non trouvé');
      }
      return domaine.toObject() as DomaineDocument;
    } catch (err) {
      logger.error(`Erreur lors de la mise à jour du domaine : ${(err as Error).message}`);
      throw err;
    }
  }

  static async delete(id: string): Promise<DomaineDocument> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw createError(400, 'ID invalide');
      }
      const domaine = await Domaine.findByIdAndDelete(id).exec();
      if (!domaine) {
        throw createError(404, 'Domaine non trouvé');
      }
      await Cours.deleteMany({ domaineId: id });
      return domaine.toObject() as DomaineDocument;
    } catch (err) {
      logger.error(`Erreur lors de la suppression du domaine : ${(err as Error).message}`);
      throw err;
    }
  }
}

class DomaineController {
  static create = async (req: Request<{}, {}, DomaineData>, res: Response, next: NextFunction) => {
    try {
      const domaine = await DomaineService.create(req.body);
      res.status(201).json(domaine);
    } catch (err) {
      next(err);
    }
  };

  static getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const domaines = await DomaineService.getAll();
      res.json({ data: domaines });
    } catch (err) {
      next(err);
    }
  };

  static getById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const domaine = await DomaineService.getById(req.params.id);
      res.json(domaine);
    } catch (err) {
      next(err);
    }
  };

  static update = async (req: Request<{ id: string }, {}, Partial<DomaineData>>, res: Response, next: NextFunction) => {
    try {
      const domaine = await DomaineService.update(req.params.id, req.body);
      res.json(domaine);
    } catch (err) {
      next(err);
    }
  };

  static delete = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const domaine = await DomaineService.delete(req.params.id);
      res.json({ message: 'Domaine supprimé avec succès', domaine });
    } catch (err) {
      next(err);
    }
  };
}

export default DomaineController;
