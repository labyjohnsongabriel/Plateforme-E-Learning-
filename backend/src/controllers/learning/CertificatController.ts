// src/controllers/learning/CertificatController.ts
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import mongoose from 'mongoose';
import CertificatService from '../../services/learning/CertificationService';
import { CertificatDocument } from '../../types'; // assume this type corresponds to the Mongoose document
import logger from '../../utils/logger';

/**
 * Controller pour la gestion des certificats (endpoints et utilitaires).
 */
class CertificatController {
  static getByUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user._id) {
        logger.error('❌ No user in request:', { user: req.user });
        throw createError(401, 'Utilisateur non authentifié');
      }

      logger.info(`📜 Fetching certificates for user: ${req.user._id}`);
      const certs = await CertificatService.getByUser(req.user._id);
      logger.info(`✅ Found ${certs.length} certificates`);

      res.json({ data: certs });
    } catch (err: unknown) {
      const error = err as Error;
      logger.error('❌ Error in getByUser:', {
        message: error.message,
        stack: error.stack,
      });
      next(err); // Propager l'erreur originale
    }
  };

  static download = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user._id) {
        logger.error('❌ No user in request:', { user: req.user });
        throw createError(401, 'Utilisateur non authentifié');
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw createError(400, 'Identifiant de certificat invalide');
      }

      logger.info(`📥 Downloading certificate: ${req.params.id} for user: ${req.user._id}`);
      const pdfBuffer = await CertificatService.generatePDF(req.user._id, req.params.id);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=certificat_${req.params.id}.pdf`,
        'Content-Length': pdfBuffer.length.toString(),
      });

      res.send(pdfBuffer);
    } catch (err: unknown) {
      const error = err as Error;
      logger.error('❌ Error in download:', {
        message: error.message,
        stack: error.stack,
      });
      next(err);
    }
  };

  /**
   * Génère un certificat pour un apprenant et un cours (utilitaire non-route).
   * Convertit les strings en ObjectId pour respecter IProgression.
   */
  static generateCertificate = async (apprenantId: string, coursId: string): Promise<CertificatDocument | null> => {
    try {
      logger.info(`🔍 Generating certificate for apprenant=${apprenantId}, cours=${coursId}`);

      // Validation
      if (!mongoose.Types.ObjectId.isValid(apprenantId)) {
        throw new Error('Identifiant d’apprenant invalide');
      }
      if (!mongoose.Types.ObjectId.isValid(coursId)) {
        throw new Error('Identifiant de cours invalide');
      }

      // Conversion en ObjectId pour correspondre au type IProgression (apprenant: ObjectId, cours: ObjectId|CourseDocument)
      const apprenantObjId = new mongoose.Types.ObjectId(apprenantId);
      const coursObjId = new mongoose.Types.ObjectId(coursId);

      // Construire l'objet progression avec les bons types
      const progressionForCert = {
        apprenant: apprenantObjId,
        cours: coursObjId,
        pourcentage: 100,
        dateFin: new Date(),
      } as any; // typed as any to match the service signature if nécessaire

      const cert = await CertificatService.generateIfEligible(progressionForCert);

      if (!cert) {
        logger.info(`🔍 No certificate generated for apprenant=${apprenantId}, cours=${coursId}`);
        return null;
      }

      logger.info(`✅ Certificate generated: ${cert._id}`);
      // Cast raisonnable si ton ICertificat correspond bien à CertificatDocument
      return cert as unknown as CertificatDocument;
    } catch (err: unknown) {
      const error = err as Error;
      logger.error('❌ Error generating certificate:', {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  };
}

export default CertificatController;