import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import mongoose from 'mongoose';
import Certificat, { ICertificat } from '../../models/learning/Certificat';
import { User } from '../../models/user/User';
import Cours, { ICours } from '../../models/course/Cours';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { CertificatDocument, UserDocument, CourseDocument } from '../../types';

/**
 * Contrôleur pour gérer les certificats.
 */
class CertificatController {
  /**
   * Récupère tous les certificats d'un utilisateur authentifié.
   * @param req - Requête Express avec utilisateur authentifié
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static getByUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const certs = await Certificat.find({ apprenant: req.user.id }).populate<{ cours: CourseDocument }>('cours', 'titre niveau');
      res.json(certs.length ? certs : []);
    } catch (err) {
      console.error('Erreur lors de la récupération des certificats:', (err as Error).message);
      next(err);
    }
  };

  /**
   * Télécharge un certificat PDF.
   * @param req - Requête Express avec paramètre ID
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static download = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const cert = await Certificat.findOne({ _id: req.params.id, apprenant: req.user.id });
      if (!cert) {
        throw createError(404, 'Certificat non trouvé ou non autorisé');
      }

      const filePath = path.join(__dirname, '../../public', cert.urlCertificat);
      if (!fs.existsSync(filePath)) {
        throw createError(404, 'Fichier du certificat non trouvé');
      }

      res.download(filePath, `certificat_${cert._id}.pdf`);
    } catch (err) {
      console.error('Erreur lors du téléchargement du certificat:', (err as Error).message);
      next(err);
    }
  };

  /**
   * Génère un certificat PDF pour un utilisateur et un cours.
   * @param apprenantId - ID de l'utilisateur
   * @param coursId - ID du cours
   * @returns Le certificat créé ou existant, ou null si le niveau est Alfa
   */
  static generateCertificate = async (apprenantId: string, coursId: string): Promise<CertificatDocument | null> => {
    try {
      const existingCert = await Certificat.findOne({ apprenant: apprenantId, cours: coursId });
      if (existingCert) {
        // CORRECTION : Plus besoin de conversion, les types sont maintenant compatibles
        return existingCert as CertificatDocument;
      }

      const user = await User.findById(apprenantId);
      const cours = await Cours.findById(coursId);
      if (!user || !cours) {
        throw new Error('Utilisateur ou cours non trouvé');
      }

      const levels = ['Alfa', 'Bêta', 'Gamma', 'Delta'];
      const levelIndex = levels.indexOf(cours.niveau);
      if (levelIndex < 1) {
        return null;
      }

      const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
      const filename = `certificat_${apprenantId}_${coursId}.pdf`;
      const dir = path.join(__dirname, '../../public/certificates');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const filePath = path.join(dir, filename);
      doc.pipe(fs.createWriteStream(filePath));

      // Contenu du PDF
      try {
        doc.image(path.join(__dirname, '../../public/logo-youth-computing.png'), 50, 50, { width: 100 });
      } catch (imgErr) {
        console.warn('Logo non trouvé, génération sans logo:', (imgErr as Error).message);
      }
      doc.fontSize(30).font('Helvetica-Bold').text('Certificat de Complétion', 150, 100, { align: 'center' });
      doc.fontSize(18).font('Helvetica').text(`Délivré à : ${user.prenom} ${user.nom}`, 150, 200);
      doc.text(`Pour le cours : ${cours.titre}`, 150, 230);
      doc.text(`Niveau : ${cours.niveau}`, 150, 260);
      doc.text(`Date d'émission : ${new Date().toLocaleDateString('fr-FR')}`, 150, 290);
      doc.fontSize(14).text('Youth Computing - Association pour la formation numérique', 150, 350, { align: 'center' });
      doc.text('Signature : _______________________', 150, 380, { align: 'center' });
      doc.end();

      const url = `/certificates/${filename}`;
      const newCert = new Certificat({
        apprenant: apprenantId,
        cours: coursId,
        dateEmission: new Date(),
        urlCertificat: url,
      });
      await newCert.save();

      // CORRECTION : Plus besoin de conversion, les types sont maintenant compatibles
      return newCert as CertificatDocument;
    } catch (err) {
      console.error('Erreur lors de la génération du certificat:', (err as Error).message);
      throw err;
    }
  };
}

export default CertificatController;