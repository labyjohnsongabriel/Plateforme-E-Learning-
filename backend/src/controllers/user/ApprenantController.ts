// src/controllers/user/ApprenantController.ts
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { User } from '../../models/user/User';
import { InscriptionService } from '../../services/learning/InscriptionService';
import { ProgressionService } from '../../services/learning/ProgressionService';
import { CertificationService } from '../../services/learning/CertificationService';
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
        .populate<{ progres: ProgressionDocument[] }>('progres', 'pourcentage dateDebut dateFin coursId')
        .lean();
      
      if (!apprenant) {
        throw createError(404, 'Apprenant non trouvé');
      }
      
      if (apprenant.role !== 'APPRENANT') {
        throw createError(400, "L'utilisateur n'est pas un apprenant");
      }
      
      res.json(apprenant.progres || []);
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
        .populate<{ certificats: CertificatDocument[] }>('certificats', 'dateEmission urlCertificat coursId titre')
        .lean();
      
      if (!apprenant) {
        throw createError(404, 'Apprenant non trouvé');
      }
      
      if (apprenant.role !== 'APPRENANT') {
        throw createError(400, "L'utilisateur n'est pas un apprenant");
      }
      
      res.json(apprenant.certificats || []);
    } catch (err) {
      console.error('Erreur lors de la récupération des certificats:', (err as Error).message);
      next(err);
    }
  };

  /**
   * Inscrit un apprenant à un cours.
   * @param req - Requête Express avec paramètre ID, corps et utilisateur authentifié
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static enrollInCourse = async (
    req: Request<{ id: string }, {}, EnrollData>, 
    res: Response, 
    next: NextFunction
  ): Promise<void> => {
    try {
      // Vérification d'autorisation améliorée
      if (!req.user || (req.user.id !== req.params.id && req.user.role !== 'ADMIN')) {
        throw createError(403, 'Accès non autorisé');
      }

      const { coursId } = req.body;
      
      if (!coursId) {
        throw createError(400, 'ID du cours requis');
      }

      // Vérifier que l'utilisateur existe et est un apprenant
      const apprenant = await User.findById(req.params.id);
      if (!apprenant) {
        throw createError(404, 'Apprenant non trouvé');
      }
      
      if (apprenant.role !== 'APPRENANT') {
        throw createError(400, "L'utilisateur n'est pas un apprenant");
      }

      const inscription = await InscriptionService.enroll(req.params.id, coursId);
      await ProgressionService.initialize(req.params.id, coursId);
      
      res.status(201).json({
        message: 'Inscription au cours réussie',
        inscription
      });
    } catch (err) {
      console.error('Erreur lors de l\'inscription au cours:', (err as Error).message);
      next(err);
    }
  };

  /**
   * Met à jour la progression d'un apprenant pour un cours.
   * @param req - Requête Express avec paramètre ID, corps et utilisateur authentifié
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static updateProgress = async (
    req: Request<{ id: string }, {}, ProgressData>, 
    res: Response, 
    next: NextFunction
  ): Promise<void> => {
    try {
      // Vérification d'autorisation
      if (!req.user || (req.user.id !== req.params.id && req.user.role !== 'ADMIN')) {
        throw createError(403, 'Accès non autorisé');
      }

      const { coursId, pourcentage } = req.body;
      
      // Validation des données
      if (!coursId || pourcentage === undefined) {
        throw createError(400, 'ID du cours et pourcentage sont requis');
      }
      
      if (pourcentage < 0 || pourcentage > 100) {
        throw createError(400, 'Le pourcentage doit être entre 0 et 100');
      }

      // Mettre à jour la progression
      const progression = await ProgressionService.update(req.params.id, coursId, pourcentage);
      
      // Générer un certificat si la progression atteint 100%
      if (pourcentage === 100) {
        try {
          const cert = await CertificationService.generateIfEligible(progression);
          if (cert) {
            const apprenant = await User.findById(req.params.id);
            if (apprenant) {
              // Éviter les doublons
              if (!apprenant.certificats.includes(cert._id)) {
                apprenant.certificats.push(cert._id);
                await apprenant.save();
              }
            }
          }
        } catch (certError) {
          console.error('Erreur lors de la génération du certificat:', (certError as Error).message);
          // Ne pas bloquer la réponse si le certificat échoue
        }
      }
      
      res.json({
        message: 'Progression mise à jour avec succès',
        progression
      });
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la progression:', (err as Error).message);
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
      
      if (!apprenant) {
        throw createError(404, 'Apprenant non trouvé');
      }
      
      if (apprenant.role !== 'APPRENANT') {
        throw createError(400, "L'utilisateur n'est pas un apprenant");
      }
      
      res.json(apprenant);
    } catch (err) {
      console.error('Erreur lors de la récupération du profil:', (err as Error).message);
      next(err);
    }
  };
}

export default ApprenantController;