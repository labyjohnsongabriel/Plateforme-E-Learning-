// src/services/learning/CertificationService.ts
import { Types } from 'mongoose';
import Certificat, { ICertificat } from '../../models/learning/Certificat';
import Cours, { ICours } from '../../models/course/Cours';
import { IProgression } from '../../models/learning/Progression';
import * as NotificationService from '../notification/NotificationService';
import * as pdfGenerator from '../../utils/pdfGenerator';
import logger from '../../utils/logger';

export enum NiveauFormation {
  ALFA = 'ALFA',
  BETA = 'BETA',
  GAMMA = 'GAMMA',
  DELTA = 'DELTA',
}

export class CertificatService {
  static async generateIfEligible(progression: IProgression): Promise<ICertificat | null> {
    try {
      if (progression.pourcentage !== 100 || !progression.dateFin) {
        logger.info(`Progression non éligible pour certificat: apprenant=${progression.apprenant}, cours=${progression.cours}`);
        return null;
      }

      const existingCert = await Certificat.findOne({
        apprenant: progression.apprenant,
        cours: progression.cours,
      });
      if (existingCert) {
        logger.info(`Certificat déjà existant pour apprenant=${progression.apprenant}, cours=${progression.cours}`);
        return existingCert;
      }

      const cours = await Cours.findById(progression.cours);
      if (!cours || !Object.values(NiveauFormation).includes(cours.niveau as NiveauFormation)) {
        logger.info(`Cours non trouvé ou niveau invalide: cours=${progression.cours}, niveau=${cours?.niveau}`);
        return null;
      }

      const apprenantId = progression.apprenant.toString();
      const url = await pdfGenerator.generateCertificate(apprenantId, cours);
      
      const cert = new Certificat({
        apprenant: progression.apprenant,
        cours: progression.cours,
        urlCertificat: url,
        dateEmission: new Date(),
      });
      await cert.save();

      await NotificationService.create({
        utilisateur: apprenantId,
        message: `Certificat pour ${cours.titre} émis !`,
        type: 'nouveau_certificat',
      });

      logger.info(`Certificat généré pour apprenant=${progression.apprenant}, cours=${progression.cours}`);
      return cert;
    } catch (err: unknown) {
      const error = err as Error;
      logger.error(`Erreur lors de la génération du certificat: ${error.message}`);
      throw error;
    }
  }
}

export default CertificatService;