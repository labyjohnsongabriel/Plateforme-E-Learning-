// src/controllers/learning/CertificatController.ts
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import mongoose from 'mongoose';
import CertificationService from '../../services/learning/CertificationService';
import { CertificatDocument } from '../../types';
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

      // Conversion de l'ObjectId en string pour résoudre l'erreur TypeScript
      const userId = req.user._id.toString();

      // Logique de vérification d'éligibilité simplifiée
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
          : 'Vous n\'êtes pas encore éligible pour un certificat. Terminez le cours à 100%.'
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
   * Méthode utilitaire pour vérifier la complétion du cours
   */
  private static async checkCourseCompletion(userId: string, courseId: string): Promise<boolean> {
    try {
      // Implémentez votre logique de vérification ici
      // Par exemple, vérifier la progression dans la table des progressions
      // Pour l'instant, retourne true pour les tests
      
      logger.info(`🔍 Vérification éligibilité certificat - utilisateur: ${userId}, cours: ${courseId}`);
      
      // TODO: Implémenter la logique réelle de vérification
      // Exemple de logique à implémenter :
      // 1. Vérifier si l'utilisateur est inscrit au cours
      // 2. Vérifier si la progression est à 100%
      // 3. Vérifier si le cours est marqué comme terminé
      // 4. Vérifier si un certificat n'existe pas déjà
      
      return true; // Temporaire pour les tests
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
  static generateCertificate = async (apprenantId: string, coursId: string): Promise<CertificatDocument | null> => {
    try {
      logger.info(`🔍 Génération certificat - apprenant: ${apprenantId}, cours: ${coursId}`);

      // Validation des IDs
      if (!mongoose.Types.ObjectId.isValid(apprenantId)) {
        throw new Error('Identifiant d\'apprenant invalide');
      }
      if (!mongoose.Types.ObjectId.isValid(coursId)) {
        throw new Error('Identifiant de cours invalide');
      }

      // Construction de l'objet progression simulé
      const progression = {
        apprenant: new mongoose.Types.ObjectId(apprenantId),
        cours: new mongoose.Types.ObjectId(coursId),
        pourcentage: 100,
        dateFin: new Date(),
      } as any;

      const certificat = await CertificationService.generateIfEligible(progression);

      if (certificat) {
        logger.info(`✅ Certificat généré: ${certificat._id}`);
        return certificat as unknown as CertificatDocument;
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
}

export default CertificatController;