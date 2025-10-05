import { Types } from 'mongoose';
import Certificat, { ICertificat } from '../../models/learning/Certificat';
import Cours, { ICours } from '../../models/course/Cours';
import { IProgression } from '../../models/learning/Progression';
import * as NotificationService from '../notification/NotificationService';
import * as pdfGenerator from '../../utils/pdfGenerator';
import logger from '../../utils/logger';

// Enum pour correspondre à ICours.niveau (basé sur User.ts et usage)
export enum NiveauFormation {
  ALFA = 'ALFA',
  BETA = 'BETA',
  GAMMA = 'GAMMA',
  DELTA = 'DELTA',
}

// Generate certificate if eligible
export const generateIfEligible = async (progression: IProgression): Promise<ICertificat | null> => {
  try {
    // Vérifier si la progression est terminée
    if (progression.pourcentage !== 100 || !progression.dateFin) {
      logger.info(`Progression non éligible pour certificat: apprenant=${progression.apprenant}, cours=${progression.cours}`);
      return null;
    }

    // Vérifier si un certificat existe déjà
    const existingCert = await Certificat.findOne({
      apprenant: progression.apprenant,
      cours: progression.cours,
    });
    if (existingCert) {
      logger.info(`Certificat déjà existant pour apprenant=${progression.apprenant}, cours=${progression.cours}`);
      return existingCert;
    }

    // Vérifier le cours
    const cours = await Cours.findById(progression.cours);
    if (!cours || !Object.values(NiveauFormation).includes(cours.niveau)) {
      logger.info(`Cours non trouvé ou niveau invalide: cours=${progression.cours}, niveau=${cours?.niveau}`);
      return null;
    }

    // Générer le certificat PDF
    const url = await pdfGenerator.generateCertificate(progression.apprenant, cours);

    // Créer et enregistrer le certificat
    const cert = new Certificat({
      apprenant: progression.apprenant,
      cours: progression.cours,
      urlCertificat: url,
      dateEmission: new Date(),
    });
    await cert.save();

    // Envoyer une notification
    await NotificationService.create({
      utilisateur: progression.apprenant.toString(), // Converti ObjectId en string
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
};