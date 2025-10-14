// src/services/learning/CertificatService.ts
import { Types } from 'mongoose';
import Certificat, { ICertificat } from '../../models/learning/Certificat';
import Cours, { ICours } from '../../models/course/Cours';
import { IProgression } from '../../models/learning/Progression';
import * as NotificationService from '../notification/NotificationService';
import { NotificationType } from '../../models/notification/Notification';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import {User} from '../../models/user/User';
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
      }).exec();
      if (existingCert) {
        logger.info(`Certificat déjà existant pour apprenant=${progression.apprenant}, cours=${progression.cours}`);
        return existingCert;
      }

      const cours = await Cours.findById(progression.cours).exec();
      const user = await User.findById(progression.apprenant).exec();
      if (!cours || !user || !Object.values(NiveauFormation).includes(cours.niveau as NiveauFormation)) {
        logger.info(`Cours ou utilisateur non trouvé ou niveau invalide: cours=${progression.cours}, niveau=${cours?.niveau}`);
        return null;
      }

      const levels = [NiveauFormation.ALFA, NiveauFormation.BETA, NiveauFormation.GAMMA, NiveauFormation.DELTA];
      const levelIndex = levels.indexOf(cours.niveau as NiveauFormation);
      if (levelIndex < 1) {
        logger.info(`Niveau ${cours.niveau} est ALFA, aucun certificat généré`);
        return null;
      }

      // Création du PDF du certificat
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
      const filename = `certificat_${progression.apprenant}_${progression.cours}.pdf`;
      const dir = path.join(__dirname, '../../public/certificates');
      if (!fs.existsSync(dir)) {
        logger.info(`📁 Création du répertoire: ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
      }
      const filePath = path.join(dir, filename);
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      try {
        doc.image(path.join(__dirname, '../../public/logo-youth-computing.png'), 50, 50, { width: 100 });
      } catch (imgErr: unknown) {
        const error = imgErr as Error;
        logger.warn(`⚠️ Logo non trouvé, génération sans logo: ${error.message}`);
      }

      doc.fontSize(30).font('Helvetica-Bold').text('Certificat de Complétion', 150, 100, { align: 'center' });
      doc.fontSize(18).font('Helvetica').text(`Délivré à : ${user.prenom} ${user.nom}`, 150, 200);
      doc.text(`Pour le cours : ${cours.titre}`, 150, 230);
      doc.text(`Niveau : ${cours.niveau}`, 150, 260);
      doc.text(`Date d'émission : ${new Date().toLocaleDateString('fr-FR')}`, 150, 290);
      doc.text('Youth Computing - Association pour la formation numérique', 150, 350, { align: 'center' });
      doc.text('Signature : _______________________', 150, 380, { align: 'center' });
      doc.end();

      // attendre la fin de l'écriture du fichier
      await new Promise<void>((resolve, reject) => {
        writeStream.on('finish', () => resolve());
        writeStream.on('error', (e) => reject(e));
      });

      const url = `/certificates/${filename}`;
      const cert = new Certificat({
        apprenant: progression.apprenant,
        cours: progression.cours,
        dateEmission: new Date(),
        urlCertificat: url,
        valide: true,
        numero: `CERT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      });
      await cert.save();

      await NotificationService.create({
        utilisateur: progression.apprenant.toString(),
        message: `Certificat pour ${cours.titre} émis !`,
        type: NotificationType.CERTIFICAT,
      });

      logger.info(`Certificat généré pour apprenant=${progression.apprenant}, cours=${progression.cours}, id=${cert._id}`);
      return cert;
    } catch (err: unknown) {
      const error = err as Error;
      logger.error(`Erreur lors de la génération du certificat: ${error.message}, stack: ${error.stack}`);
      throw error;
    }
  }

  /**
   * Récupère les certificats d'un utilisateur.
   * Résout le problème de typage après .lean() en typant explicitement le résultat et en normalisant la propriété `cours`.
   */
  static async getByUser(apprenantId: string | Types.ObjectId): Promise<ICertificat[]> {
    try {
      // Valider l'ObjectId si c'est une string
      if (typeof apprenantId === 'string' && !Types.ObjectId.isValid(apprenantId)) {
        throw new Error('Identifiant d’apprenant invalide');
      }

      logger.info(`📜 Récupération des certificats pour apprenant: ${apprenantId}`);

      // On utilise .lean() pour de meilleures perf, mais on cast d'abord en unknown puis en type intermédiaire
      const certificatsLean = (await Certificat.find({ apprenant: apprenantId })
        .populate('cours', 'titre niveau')
        .lean()
        .exec()) as unknown as Array<ICertificat & { cours?: Partial<ICours> }>;

      logger.info(`✅ Trouvé ${certificatsLean.length} certificats (lean)`);

      // Normaliser et s'assurer du typage conforme ICertificat[]
      const normalized: ICertificat[] = certificatsLean.map((c) => {
        // s'assurer que cours est bien typé
        const cours = c.cours ? ((c.cours as Partial<ICours>) as ICours) : (undefined as any);

        // construire objet qui correspond à ICertificat (selon ton interface)
        return {
          // on reprend toutes les propriétés retournées par mongoose lean (inclut _id, dateEmission, urlCertificat, valide, numero, etc.)
          ...(c as unknown as ICertificat),
          cours,
        } as ICertificat;
      });

      return normalized;
    } catch (err: unknown) {
      const error = err as Error;
      logger.error(`Erreur lors de la récupération des certificats: ${error.message}, stack: ${error.stack}`);
      throw error;
    }
  }

  /**
   * Génère un PDF en mémoire pour un certificat existant
   */
  static async generatePDF(apprenantId: string | Types.ObjectId, certificatId: string | Types.ObjectId): Promise<Buffer> {
    try {
      // Validation basique des ObjectId (si strings)
      if ((typeof apprenantId === 'string' && !Types.ObjectId.isValid(apprenantId)) ||
          (typeof certificatId === 'string' && !Types.ObjectId.isValid(certificatId))) {
        throw new Error('Identifiant invalide');
      }

      logger.info(`📥 Génération du PDF pour certificat: ${certificatId}, apprenant: ${apprenantId}`);
      const certificat = await Certificat.findOne({
        _id: certificatId,
        apprenant: apprenantId,
      }).populate<{ cours: ICours }>('cours', 'titre niveau').exec();

      if (!certificat) {
        throw new Error('Certificat non trouvé');
      }

      const user = await User.findById(apprenantId).exec();
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      // pas besoin d'un listener vide 'end' avant la promesse

      try {
        doc.image(path.join(__dirname, '../../public/logo-youth-computing.png'), 50, 50, { width: 100 });
      } catch (imgErr: unknown) {
        const error = imgErr as Error;
        logger.warn(`⚠️ Logo non trouvé, génération sans logo: ${error.message}`);
      }

      doc.fontSize(30).font('Helvetica-Bold').text('Certificat de Complétion', 150, 100, { align: 'center' });
      doc.fontSize(18).font('Helvetica').text(`Délivré à : ${user.prenom} ${user.nom}`, 150, 200);
      doc.text(`Pour le cours : ${(certificat.cours as ICours).titre}`, 150, 230);
      doc.text(`Niveau : ${(certificat.cours as ICours).niveau}`, 150, 260);
      doc.text(`Date d'émission : ${new Date(certificat.dateEmission).toLocaleDateString('fr-FR')}`, 150, 290);
      doc.text('Youth Computing - Association pour la formation numérique', 150, 350, { align: 'center' });
      doc.text('Signature : _______________________', 150, 380, { align: 'center' });
      doc.end();

      return await new Promise<Buffer>((resolve, reject) => {
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });
        doc.on('error', (e) => reject(e));
      });
    } catch (err: unknown) {
      const error = err as Error;
      logger.error(`Erreur lors de la génération du PDF: ${error.message}, stack: ${error.stack}`);
      throw error;
    }
  }
}

export default CertificatService;
