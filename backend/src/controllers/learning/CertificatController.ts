// src/controllers/learning/CertificatController.ts
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import mongoose from 'mongoose';
import CertificationService from '../../services/learning/CertificationService';
import { ICertificat } from '../../models/learning/Certificat';
import logger from '../../utils/logger';

/**
 * Controller pour la gestion des certificats
 */
class CertificatController {
  /**
   * Récupère les certificats de l'utilisateur connecté
   */
  static getByUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user._id) {
        logger.error('❌ Utilisateur non authentifié', { user: req.user });
        throw createError(401, 'Utilisateur non authentifié');
      }

      logger.info(`📜 Récupération certificats utilisateur: ${req.user._id}`);
      const certificats = await CertificationService.getByUser(req.user._id);
      
      logger.info(`✅ ${certificats.length} certificats récupérés`);
      
      res.json({
        success: true,
        data: certificats,
        count: certificats.length,
        message: certificats.length > 0 
          ? 'Certificats récupérés avec succès' 
          : 'Aucun certificat trouvé'
      });

    } catch (err: unknown) {
      const error = err as Error;
      logger.error('❌ Erreur getByUser:', {
        message: error.message,
        stack: error.stack,
        userId: req.user?._id
      });
      next(createError(500, 'Erreur lors de la récupération des certificats'));
    }
  };

  /**
   * Télécharge un certificat spécifique
   */
  static download = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user._id) {
        logger.error('❌ Utilisateur non authentifié pour téléchargement');
        throw createError(401, 'Utilisateur non authentifié');
      }

      const certificatId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(certificatId)) {
        logger.error('❌ ID de certificat invalide', { certificatId });
        throw createError(400, 'Identifiant de certificat invalide');
      }

      logger.info(`📥 Téléchargement certificat: ${certificatId} pour utilisateur: ${req.user._id}`);

      // Génération du PDF
      const pdfBuffer = await CertificationService.generatePDF(req.user._id.toString(), certificatId);
      
      // Configuration de la réponse
      const filename = `certificat_youth_computing_${certificatId}.pdf`;
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });

      res.send(pdfBuffer);
      logger.info(`✅ Certificat ${certificatId} téléchargé avec succès`);

    } catch (err: unknown) {
      const error = err as Error;
      logger.error('❌ Erreur download:', {
        message: error.message,
        stack: error.stack,
        certificatId: req.params.id,
        userId: req.user?._id
      });

      if (error.message.includes('non trouvé') || error.message.includes('introuvable')) {
        next(createError(404, 'Certificat non trouvé'));
      } else if (error.message.includes('invalide')) {
        next(createError(400, 'Identifiant invalide'));
      } else {
        next(createError(500, 'Erreur lors du téléchargement du certificat'));
      }
    }
  };

  /**
   * Affiche un certificat dans le navigateur (au lieu de le télécharger)
   */
  static view = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user._id) {
        throw createError(401, 'Utilisateur non authentifié');
      }

      const certificatId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(certificatId)) {
        throw createError(400, 'Identifiant de certificat invalide');
      }

      logger.info(`👁️ Affichage certificat: ${certificatId} pour utilisateur: ${req.user._id}`);

      const pdfBuffer = await CertificationService.generatePDF(req.user._id.toString(), certificatId);
      
      const filename = `certificat_youth_computing_${certificatId}.pdf`;
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600'
      });

      res.send(pdfBuffer);
      logger.info(`✅ Certificat ${certificatId} affiché avec succès`);

    } catch (err: unknown) {
      const error = err as Error;
      logger.error('❌ Erreur view:', {
        message: error.message,
        stack: error.stack,
        certificatId: req.params.id,
        userId: req.user?._id
      });
      next(createError(500, 'Erreur lors de l\'affichage du certificat'));
    }
  };

  /**
   * Vérifie l'éligibilité pour un certificat
   */
  static checkEligibility = async (req: Request<{ courseId: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user._id) {
        throw createError(401, 'Utilisateur non authentifié');
      }

      const courseId = req.params.courseId;

      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        throw createError(400, 'Identifiant de cours invalide');
      }

      // Conversion de l'ObjectId en string
      const userId = req.user._id.toString();

      // Logique de vérification d'éligibilité
      const isEligible = await this.checkCourseCompletion(userId, courseId);
      
      res.json({
        success: true,
        data: { 
          isEligible,
          courseId,
          userId
        },
        message: isEligible 
          ? 'Félicitations ! Vous êtes éligible pour un certificat.' 
          : 'Vous n\'êtes pas encore éligible pour un certificat. Terminez le cours à au moins 70%.'
      });

    } catch (err: unknown) {
      const error = err as Error;
      logger.error('❌ Erreur checkEligibility:', {
        message: error.message,
        stack: error.stack,
        courseId: req.params.courseId,
        userId: req.user?._id
      });
      next(createError(500, 'Erreur lors de la vérification d\'éligibilité'));
    }
  };

  /**
   * Méthode utilitaire pour vérifier la complétion du cours (70% minimum)
   */
  private static async checkCourseCompletion(userId: string, courseId: string): Promise<boolean> {
    try {
      // Import dynamique pour éviter les dépendances circulaires
      const Progression = (await import('../../models/learning/Progression')).default;
      
      const progression = await Progression.findOne({
        apprenant: new mongoose.Types.ObjectId(userId),
        cours: new mongoose.Types.ObjectId(courseId)
      }).exec();

      if (!progression) {
        logger.info(`Aucune progression trouvée pour l'utilisateur ${userId} dans le cours ${courseId}`);
        return false;
      }

      // Vérification si la progression est d'au moins 70% ET a une date de fin
      const estEligible = progression.pourcentage >= 70 && !!progression.dateFin;
      
      logger.info(`🔍 Vérification éligibilité - utilisateur: ${userId}, cours: ${courseId}, progression: ${progression.pourcentage}%, dateFin: ${progression.dateFin}, éligible: ${estEligible}`);
      
      return estEligible;

    } catch (error) {
      logger.error('Erreur lors de la vérification de complétion du cours', {
        userId,
        courseId,
        error
      });
      return false;
    }
  }

  /**
   * Génère un certificat pour un apprenant et un cours (utilitaire)
   */
  static generateCertificate = async (apprenantId: string, coursId: string): Promise<ICertificat | null> => {
    try {
      logger.info(`🔍 Génération certificat - apprenant: ${apprenantId}, cours: ${coursId}`);

      // Validation des IDs
      if (!mongoose.Types.ObjectId.isValid(apprenantId)) {
        throw new Error('Identifiant d\'apprenant invalide');
      }
      if (!mongoose.Types.ObjectId.isValid(coursId)) {
        throw new Error('Identifiant de cours invalide');
      }

      // Import dynamique pour éviter les dépendances circulaires
      const Progression = (await import('../../models/learning/Progression')).default;

      // Récupération de la progression réelle
      const progressionExistante = await Progression.findOne({
        apprenant: new mongoose.Types.ObjectId(apprenantId),
        cours: new mongoose.Types.ObjectId(coursId)
      }).exec();

      if (!progressionExistante) {
        logger.error('❌ Progression non trouvée pour génération certificat', {
          apprenantId,
          coursId
        });
        return null;
      }

      // Vérification que la progression est d'au moins 70%
      if (progressionExistante.pourcentage < 70) {
        logger.info(`❌ Progression insuffisante pour certificat: ${progressionExistante.pourcentage}%`);
        return null;
      }

      const certificat = await CertificationService.generateIfEligible(progressionExistante);

      if (certificat) {
        logger.info(`✅ Certificat généré: ${certificat._id}`);
        return certificat;
      } else {
        logger.info(`ℹ️ Aucun certificat généré - conditions non remplies`);
        return null;
      }

    } catch (err: unknown) {
      const error = err as Error;
      logger.error('❌ Erreur generateCertificate:', {
        message: error.message,
        stack: error.stack,
        apprenantId,
        coursId
      });
      throw error;
    }
  };

  /**
   * Route utilitaire pour corriger les certificats sans cours
   */
  static corrigerCertificats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        throw createError(403, 'Accès non autorisé');
      }

      // CORRECTION : Utiliser la bonne méthode du service
      const resultat = await CertificationService.corrigerCertificatsAvecCoursNull();
      
      res.json({
        success: true,
        data: resultat,
        message: `Correction terminée: ${resultat.corriges}/${resultat.total} certificats corrigés`
      });

    } catch (err: unknown) {
      const error = err as Error;
      logger.error('❌ Erreur corrigerCertificats:', error);
      next(createError(500, 'Erreur lors de la correction des certificats'));
    }
  };

  /**
   * Route pour lancer la migration complète des certificats
   */
  static migrationCertificats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        throw createError(403, 'Accès non autorisé');
      }

      logger.info('🚀 Démarrage migration certificats demandée par admin');
      await CertificationService.migrationCorrectionCertificats();
      
      res.json({
        success: true,
        message: 'Migration des certificats terminée avec succès'
      });

    } catch (err: unknown) {
      const error = err as Error;
      logger.error('❌ Erreur migrationCertificats:', error);
      next(createError(500, 'Erreur lors de la migration des certificats'));
    }
  };

  /**
   * Vérifie l'intégrité d'un certificat spécifique
   */
  static verifierIntegrite = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        throw createError(403, 'Accès non autorisé');
      }

      const certificatId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(certificatId)) {
        throw createError(400, 'Identifiant de certificat invalide');
      }

      const integrite = await CertificationService.verifierIntegriteCertificat(certificatId);
      
      res.json({
        success: true,
        data: integrite,
        message: integrite.certificatExiste && integrite.coursExiste && integrite.utilisateurExiste
          ? 'Certificat valide'
          : 'Problèmes détectés avec le certificat'
      });

    } catch (err: unknown) {
      const error = err as Error;
      logger.error('❌ Erreur verifierIntegrite:', error);
      next(createError(500, 'Erreur lors de la vérification d\'intégrité'));
    }
  };
}

export default CertificatController;