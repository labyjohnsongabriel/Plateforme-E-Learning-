import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import mongoose from 'mongoose';
import Contenu from '../../models/course/Contenu';
import Cours from '../../models/course/Cours';
import { ContenuDocument, ContenuData } from '../../types';

class ContenuService {
  static async create(data: ContenuData, file?: Express.Multer.File): Promise<ContenuDocument> {
    if (file) {
      data.url = `/uploads/${file.filename}`;
    }
    const contenu = new Contenu(data);
    await contenu.save();
    await Cours.findByIdAndUpdate(data.cours, {
      $push: { contenus: contenu._id },
    });
    return contenu;
  }

  static async getAll(): Promise<ContenuDocument[]> {
    return Contenu.find().populate('cours');
  }

  static async getById(id: string): Promise<ContenuDocument> {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw createError(400, `ID de contenu invalide: ${id}`);
    }
    const contenu = await Contenu.findById(id).populate('cours');
    if (!contenu) {
      throw createError(404, 'Contenu non trouvé');
    }
    return contenu;
  }

  static async getByCourseId(courseId: string): Promise<ContenuDocument[]> {
    const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
    if (!isValidObjectId(courseId)) {
      throw createError(400, `ID de cours invalide: ${courseId}`);
    }
    const course = await Cours.findById(courseId);
    if (!course) {
      throw createError(404, `Cours avec ID ${courseId} non trouvé`);
    }
    const contenus = await Contenu.find({ cours: courseId }).populate('cours').exec();
    return contenus || [];
  }

  static async update(id: string, data: Partial<ContenuData>, file?: Express.Multer.File): Promise<ContenuDocument> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError(400, `ID de contenu invalide: ${id}`);
    }
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError(400, `ID de contenu invalide: ${id}`);
    }
    const contenu = await Contenu.findByIdAndDelete(id);
    if (!contenu) {
      throw createError(404, 'Contenu non trouvé');
    }
    await Cours.findByIdAndUpdate(contenu.cours, {
      $pull: { contenus: contenu._id },
    });
    return contenu;
  }
}

class ContenuController {
  static create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const contenu = await ContenuService.create(req.body, req.file);
      res.status(201).json(contenu);
    } catch (err: any) {
      console.error('Error in create:', err.message || err);
      next(err);
    }
  };

  static getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const contenus = await ContenuService.getAll();
      res.json(contenus);
    } catch (err: any) {
      console.error('Error in getAll:', err.message || err);
      next(err);
    }
  };

  static getById = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const contenu = await ContenuService.getById(req.params.id);
      res.json(contenu);
    } catch (err: any) {
      console.error('Error in getById:', err.message || err);
      next(err);
    }
  };

  static getByCourseId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.query;
      if (!courseId || typeof courseId !== 'string') {
        throw createError(400, `courseId query parameter is required and must be a string. Received: ${courseId}`);
      }
      const contenus = await ContenuService.getByCourseId(courseId);
      res.json(contenus);
    } catch (err: any) {
      console.error('Error in getByCourseId:', err.message || err, 'courseId:', req.query.courseId);
      next(err);
    }
  };

  static update = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const contenu = await ContenuService.update(req.params.id, req.body, req.file);
      res.json(contenu);
    } catch (err: any) {
      console.error('Error in update:', err.message || err);
      next(err);
    }
  };

  static delete = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const contenu = await ContenuService.delete(req.params.id);
      res.json({ message: 'Contenu supprimé' });
    } catch (err: any) {
      console.error('Error in delete:', err.message || err);
      next(err);
    }
  };
}

export default ContenuController;