// src/controllers/user/ApprenantController.ts
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import  {User}  from '../../models/user/User';
import  {InscriptionService} from '../../services/learning/InscriptionService';
import {ProgressionService}  from '../../services/learning/ProgressionService';
import  {CertificationService} from '../../services/learning/CertificationService';
import { UserDocument, ProgressionDocument, CertificatDocument, EnrollData, ProgressData } from '../../types';

/**
 * Contrôleur pour gérer les fonctionnalités des apprenants.
 */
class ApprenantController {
  /**
   * Récupère les progrès d'un apprenant.
   * @param req - Requête Express avec paramètre ID
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static getProgress = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const apprenant = await User.findById(req.params.id)
        .populate<{ progres: ProgressionDocument[] }>('progres', 'pourcentage dateDebut dateFin')
        .lean();
      if (!apprenant || apprenant.role !== 'APPRENANT') {
        throw createError(404, 'Apprenant non trouvé');
      }
      res.json(apprenant.progres);
    } catch (err) {
      console.error('Erreur lors de la récupération des progrès:', (err as Error).message);
      next(err);
    }
  };

  /**
   * Récupère les certificats d'un apprenant.
   * @param req - Requête Express avec paramètre ID
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static getCertificates = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const apprenant = await User.findById(req.params.id)
        .populate<{ certificats: CertificatDocument[] }>('certificats', 'dateEmission urlCertificat')
        .lean();
      if (!apprenant || apprenant.role !== 'APPRENANT') {
        throw createError(404, 'Apprenant non trouvé');
      }
      res.json(apprenant.certificats);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Inscrit un apprenant à un cours.
   * @param req - Requête Express avec paramètre ID, corps et utilisateur authentifié
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static enrollInCourse = async (req: Request<{ id: string }, {}, EnrollData>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || (req.user.id !== req.params.id && req.user.role !== 'ADMIN')) {
        throw createError(403, 'Accès non autorisé');
      }
      const { coursId } = req.body;
      const inscription = await InscriptionService.enroll(req.params.id, coursId);
      await ProgressionService.initialize(req.params.id, coursId);
      res.status(201).json(inscription);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Met à jour la progression d'un apprenant pour un cours.
   * @param req - Requête Express avec paramètre ID, corps et utilisateur authentifié
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static updateProgress = async (req: Request<{ id: string }, {}, ProgressData>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || (req.user.id !== req.params.id && req.user.role !== 'ADMIN')) {
        throw createError(403, 'Accès non autorisé');
      }
      const { coursId, pourcentage } = req.body;
      const progression = await ProgressionService.update(req.params.id, coursId, pourcentage);
      if (pourcentage === 100) {
        const cert = await CertificationService.generateIfEligible(progression);
        if (cert) {
          const apprenant = await User.findById(req.params.id);
          if (apprenant) {
            apprenant.certificats.push(cert._id);
            await apprenant.save();
          }
        }
      }
      res.json(progression);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Récupère le profil d'un apprenant.
   * @param req - Requête Express avec paramètre ID
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static getProfile = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const apprenant = await User.findById(req.params.id)
        .populate<{ progres: ProgressionDocument[], certificats: CertificatDocument[] }>('progres certificats')
        .select('-motDePasse')
        .lean();
      if (!apprenant || apprenant.role !== 'APPRENANT') {
        throw createError(404, 'Apprenant non trouvé');
      }
      res.json(apprenant);
    } catch (err) {
      next(err);
    }
  };
}

export default ApprenantController;