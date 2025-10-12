import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import mongoose from 'mongoose';
import Contenu from '../../models/course/Contenu'; // ✅ Changed to default import
import Cours from '../../models/course/Cours'; // ✅ Changed to default import
import { ContenuDocument, ContenuData } from '../../types';

class ContenuService {
  static async create(data: ContenuData, file?: Express.Multer.File): Promise<ContenuDocument> {
    if (file) {
      data.url = `/uploads/${file.filename}`;
    }
    const contenu = new Contenu(data);
    await contenu.save();
    // Ajouter au cours
    await Cours.findByIdAndUpdate(data.cours, {
      $push: { contenus: contenu._id },
    });
    return contenu;
  }

  static async getAll(): Promise<ContenuDocument[]> {
    return Contenu.find().populate('cours');
  }

  static async getById(id: string): Promise<ContenuDocument> {
    const contenu = await Contenu.findById(id).populate('cours');
    if (!contenu) {
      throw createError(404, 'Contenu non trouvé');
    }
    return contenu;
  }

  static async update(id: string, data: Partial<ContenuData>, file?: Express.Multer.File): Promise<ContenuDocument> {
    if (file) {
      data.url = `/uploads/${file.filename}`;
    }
    const contenu = await Contenu.findByIdAndUpdate(id, data, { new: true });
    if (!contenu) {
      throw createError(404, 'Contenu non trouvé');
    }
    return contenu;
  }

  static async delete(id: string): Promise<ContenuDocument> {
    const contenu = await Contenu.findByIdAndDelete(id);
    if (!contenu) {
      throw createError(404, 'Contenu non trouvé');
    }
    return contenu;
  }
}

class ContenuController {
  static create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const contenu = await ContenuService.create(req.body, req.file);
      res.status(201).json(contenu);
    } catch (err) {
      next(err);
    }
  };

  static getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const contenus = await ContenuService.getAll();
      res.json(contenus);
    } catch (err) {
      next(err);
    }
  };

  static getById = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const contenu = await ContenuService.getById(req.params.id);
      res.json(contenu);
    } catch (err) {
      next(err);
    }
  };

  static update = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const contenu = await ContenuService.update(req.params.id, req.body, req.file);
      res.json(contenu);
    } catch (err) {
      next(err);
    }
  };

  static delete = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const contenu = await ContenuService.delete(req.params.id);
      res.json({ message: 'Contenu supprimé' });
    } catch (err) {
      next(err);
    }
  };
}

export default ContenuController;