// src/controllers/user/UserController.ts
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import mongoose from 'mongoose';
import { User, Apprenant, Administrateur } from '../../models/user/User'; // Fixed import syntax
import { UserService } from '../../services/user/UserService'; // Correct import path
import { UserDocument, ApprenantDocument, AdministrateurDocument, UserData, StatsData, CertificatDocument } from '../../types';

/**
 * Service pour gérer les apprenants.
 */
class ApprenantService {
  static async getProgress(id: string): Promise<any> {
    const apprenant = await Apprenant.findById(id);
    if (!apprenant) throw createError(404, 'Apprenant non trouvé');
    return await apprenant.visualiserProgres();
  }

  static async getCertificats(id: string): Promise<CertificatDocument[]> {
    return await mongoose.model<CertificatDocument>('Certificat').find({ utilisateur: id });
  }
}

/**
 * Service pour gérer les administrateurs.
 */
class AdministrateurService {
  static async gererUtilisateurs(): Promise<UserDocument[]> {
    const admin = await Administrateur.findOne();
    if (!admin) throw createError(403, 'Accès non autorisé');
    return await admin.gererUtilisateurs();
  }

  static async genererStatistiques(): Promise<StatsData> {
    const admin = await Administrateur.findOne();
    if (!admin) throw createError(403, 'Accès non autorisé');
    return await admin.genererStatistiques();
  }
}

/**
 * Contrôleur pour gérer les utilisateurs.
 */
class UserController {
  static getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        throw createError(403, 'Accès réservé aux administrateurs');
      }
      const users = await UserService.getAllUsers();
      res.json(users);
    } catch (err) {
      next(err);
    }
  };

  static getById = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || (req.user.id !== req.params.id && req.user.role !== 'ADMIN')) {
        throw createError(403, 'Accès non autorisé');
      }
      const user = await UserService.getById(req.params.id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  };

  static update = async (req: Request<{ id: string }, {}, UserData>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || (req.user.id !== req.params.id && req.user.role !== 'ADMIN')) {
        throw createError(403, 'Accès non autorisé');
      }
      const user = await UserService.updateUser(req.params.id, req.body);
      res.json(user);
    } catch (err) {
      next(err);
    }
  };

  static delete = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        throw createError(403, 'Accès réservé aux administrateurs');
      }
      await UserService.deleteUser(req.params.id);
      res.json({ message: 'Utilisateur supprimé' });
    } catch (err) {
      next(err);
    }
  };
}

export { UserController };