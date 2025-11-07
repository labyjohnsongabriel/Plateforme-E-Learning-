// src/services/learning/CertificationService.ts
import { Types, Document } from 'mongoose';
import Certificat, { ICertificat } from '../../models/learning/Certificat';
import Cours, { ICours } from '../../models/course/Cours';
import { IProgression } from '../../models/learning/Progression';
import * as NotificationService from '../notification/NotificationService';
import { NotificationType } from '../../models/notification/Notification';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { User } from '../../models/user/User';
import logger from '../../utils/logger';

export enum NiveauFormation {
  ALFA = 'ALFA',
  BETA = 'BETA',
  GAMMA = 'GAMMA',
  DELTA = 'DELTA',
}

// Interface pour les données du certificat avec cours peuplé
interface CertificatAvecCours extends Omit<ICertificat, 'cours'> {
  cours: ICours;
}

interface CertificatData {
  certificat: CertificatAvecCours;
  cours: ICours;
  user: any;
}

// Couleurs professionnelles pour le certificat
const CERTIFICATE_COLORS = {
  primary: '#2C3E50',
  secondary: '#E67E22',
  accent: '#16A085',
  gold: '#D4AF37',
  lightBg: '#F8F9FA',
  textDark: '#2C3E50',
  textLight: '#7F8C8D'
};

export class CertificationService {
  /**
   * Génère un certificat si l'utilisateur est éligible
   */
  static async generateIfEligible(progression: IProgression): Promise<ICertificat | null> {
    try {
      // Vérification de l'éligibilité
      if (progression.pourcentage !== 100 || !progression.dateFin) {
        logger.info(`Progression non éligible pour certificat: apprenant=${progression.apprenant}, cours=${progression.cours}`);
        return null;
      }

      // Vérification si le certificat existe déjà
      const existingCert = await Certificat.findOne({
        apprenant: progression.apprenant,
        cours: progression.cours,
      }).exec();
      
      if (existingCert) {
        logger.info(`Certificat déjà existant pour apprenant=${progression.apprenant}, cours=${progression.cours}`);
        return existingCert;
      }

      // Récupération du cours et de l'utilisateur avec vérification
      const cours = await Cours.findById(progression.cours).exec();
      const user = await User.findById(progression.apprenant).exec();
      
      if (!cours) {
        logger.error('❌ Cours non trouvé pour génération certificat', {
          coursId: progression.cours,
          apprenantId: progression.apprenant
        });
        return null;
      }

      if (!user) {
        logger.error('❌ Utilisateur non trouvé pour génération certificat', {
          userId: progression.apprenant,
          coursId: progression.cours
        });
        return null;
      }

      // Validation du niveau de formation
      if (!Object.values(NiveauFormation).includes(cours.niveau as NiveauFormation)) {
        logger.info(`Niveau de cours invalide: ${cours.niveau}`);
        return null;
      }

      const levels = [NiveauFormation.ALFA, NiveauFormation.BETA, NiveauFormation.GAMMA, NiveauFormation.DELTA];
      const levelIndex = levels.indexOf(cours.niveau as NiveauFormation);
      
      if (levelIndex < 1) {
        logger.info(`Niveau ${cours.niveau} est ALFA, aucun certificat généré`);
        return null;
      }

      // Génération du PDF
      const pdfBuffer = await this.generateCertificatePDF(user, cours);
      const filename = `certificat_${progression.apprenant}_${progression.cours}_${Date.now()}.pdf`;
      const dir = path.join(__dirname, '../../public/certificates');
      
      // Création du répertoire si inexistant
      if (!fs.existsSync(dir)) {
        logger.info(`📁 Création du répertoire: ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const filePath = path.join(dir, filename);
      fs.writeFileSync(filePath, pdfBuffer);

      const url = `/certificates/${filename}`;
      
      // Création du certificat en base de données
      const cert = new Certificat({
        apprenant: progression.apprenant,
        cours: progression.cours,
        dateEmission: new Date(),
        urlCertificat: url,
        valide: true,
        numero: `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      });
      
      await cert.save();

      // Notification
      await NotificationService.create({
        utilisateur: progression.apprenant.toString(),
        message: `Félicitations ! Votre certificat pour le cours "${cours.titre}" a été émis.`,
        type: NotificationType.CERTIFICAT,
      });

      logger.info(`✅ Certificat généré pour apprenant=${progression.apprenant}, cours=${progression.cours}, id=${cert._id}`);
      return cert;

    } catch (err: unknown) {
      const error = err as Error;
      logger.error(`❌ Erreur lors de la génération du certificat: ${error.message}`, {
        stack: error.stack,
        apprenantId: progression.apprenant,
        coursId: progression.cours
      });
      throw error;
    }
  }

  /**
   * Récupère les certificats d'un utilisateur
   */
  static async getByUser(apprenantId: string | Types.ObjectId): Promise<ICertificat[]> {
    try {
      // Validation de l'ID
      if (typeof apprenantId === 'string' && !Types.ObjectId.isValid(apprenantId)) {
        throw new Error('Identifiant d\'apprenant invalide');
      }

      logger.info(`📜 Récupération des certificats pour apprenant: ${apprenantId}`);

      const certificats = await Certificat.find({ apprenant: apprenantId })
        .populate<{ cours: ICours }>('cours', 'titre niveau description')
        .lean()
        .exec();

      logger.info(`✅ Trouvé ${certificats.length} certificats pour l'utilisateur ${apprenantId}`);

      return certificats as unknown as ICertificat[];
    } catch (err: unknown) {
      const error = err as Error;
      logger.error(`❌ Erreur lors de la récupération des certificats: ${error.message}`, {
        stack: error.stack,
        apprenantId
      });
      throw error;
    }
  }

  /**
   * Génère un PDF en mémoire pour un certificat existant
   */
  static async generatePDF(apprenantId: string | Types.ObjectId, certificatId: string | Types.ObjectId): Promise<Buffer> {
    try {
      // Validation des IDs
      if ((typeof apprenantId === 'string' && !Types.ObjectId.isValid(apprenantId)) ||
          (typeof certificatId === 'string' && !Types.ObjectId.isValid(certificatId))) {
        throw new Error('Identifiant invalide');
      }

      logger.info(`📥 Génération du PDF pour certificat: ${certificatId}, apprenant: ${apprenantId}`);

      // Récupération du certificat avec populate et vérification approfondie
      const certificat = await Certificat.findOne({
        _id: certificatId,
        apprenant: apprenantId,
      }).populate<{ cours: ICours }>('cours').exec();

      if (!certificat) {
        logger.error('❌ Certificat non trouvé', { certificatId, apprenantId });
        throw new Error('Certificat non trouvé');
      }

      // Vérification détaillée du cours
      if (!certificat.cours) {
        logger.error('❌ Cours non trouvé pour le certificat', {
          certificatId,
          apprenantId,
          coursId: certificat.cours
        });
        
        // Tentative de récupération directe du cours depuis la base
        const coursDirect = await Cours.findById(certificat.cours).exec();
        if (!coursDirect) {
          throw new Error('Cours associé au certificat introuvable');
        }
        
        // Si le cours est trouvé directement, on l'assigne
        (certificat as any).cours = coursDirect;
      }

      const user = await User.findById(apprenantId).exec();
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Vérification finale que le cours est disponible
      if (!certificat.cours) {
        throw new Error('Impossible de récupérer les informations du cours');
      }

      // Conversion en CertificatAvecCours pour résoudre le problème de typage
      const certificatAvecCours: CertificatAvecCours = {
        ...certificat.toObject(),
        cours: certificat.cours as ICours
      };

      // Génération du PDF professionnel
      return await this.generateProfessionalCertificate({
        certificat: certificatAvecCours,
        cours: certificat.cours as ICours,
        user
      });

    } catch (err: unknown) {
      const error = err as Error;
      logger.error(`❌ Erreur lors de la génération du PDF: ${error.message}`, {
        stack: error.stack,
        certificatId,
        apprenantId
      });
      throw error;
    }
  }

  /**
   * Génère un PDF de certificat professionnel
   */
  private static async generateProfessionalCertificate(data: CertificatData): Promise<Buffer> {
    return new Promise<Buffer>(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          size: 'A4', 
          layout: 'landscape',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
          }
        });

        const buffers: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // Arrière-plan élégant avec dégradé
        this.drawCertificateBackground(doc);

        // En-tête avec logo
        await this.drawHeader(doc);

        // Titre principal
        this.drawMainTitle(doc);

        // Informations du récipiendaire
        this.drawRecipientInfo(doc, data.user);

        // Informations du cours
        this.drawCourseInfo(doc, data.cours);

        // Date et numéro de certificat
        this.drawCertificateDetails(doc, data.certificat);

        // Signature et footer
        this.drawFooter(doc);

        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Dessine l'arrière-plan du certificat
   */
  private static drawCertificateBackground(doc: PDFKit.PDFDocument): void {
    // Fond principal avec dégradé
    const gradient = doc.linearGradient(0, 0, doc.page.width, doc.page.height);
    gradient.stop(0, CERTIFICATE_COLORS.lightBg);
    gradient.stop(1, '#FFFFFF');
    
    doc.rect(0, 0, doc.page.width, doc.page.height)
       .fill(gradient);

    // Bordure décorative
    doc.strokeColor(CERTIFICATE_COLORS.gold)
       .lineWidth(8)
       .roundedRect(20, 20, doc.page.width - 40, doc.page.height - 40, 10)
       .stroke();

    // Motif de fond subtil avec opacité réduite
    doc.fillColor(CERTIFICATE_COLORS.primary);
    
    // Utilisation de save/restore pour gérer l'état graphique
    doc.save();
    (doc as any).opacity(0.03); // Cast pour contourner le typage strict
    
    for (let i = 0; i < doc.page.width; i += 80) {
      for (let j = 0; j < doc.page.height; j += 80) {
        doc.text('✓', i, j, { 
          align: 'center'
        });
      }
    }
    
    doc.restore(); // Restaure l'état graphique précédent
  }

  /**
   * Dessine l'en-tête avec logo
   */
  private static async drawHeader(doc: PDFKit.PDFDocument): Promise<void> {
    const logoPath = path.join(__dirname, '../../public/logo-youth-computing.png');
    
    try {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, doc.page.width - 150, 40, { 
          width: 100,
          align: 'right'
        });
      }
    } catch (error) {
      logger.warn('Logo non trouvé, continuation sans logo');
    }

    // Texte d'en-tête
    doc.fillColor(CERTIFICATE_COLORS.primary)
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('YOUTH COMPUTING', 50, 50)
       .fontSize(12)
       .font('Helvetica')
       .text('Association pour la Formation Numérique', 50, 70);
  }

  /**
   * Dessine le titre principal
   */
  private static drawMainTitle(doc: PDFKit.PDFDocument): void {
    doc.fillColor(CERTIFICATE_COLORS.primary)
       .fontSize(36)
       .font('Helvetica-Bold')
       .text('CERTIFICAT DE RÉUSSITE', 0, 150, {
         align: 'center',
         underline: true
       });
    
    // Ajout d'une ligne décorative colorée sous le titre
    doc.save();
    doc.strokeColor(CERTIFICATE_COLORS.secondary)
       .lineWidth(3)
       .moveTo(doc.page.width / 2 - 100, 190)
       .lineTo(doc.page.width / 2 + 100, 190)
       .stroke();
    doc.restore();
  }

  /**
   * Dessine les informations du récipiendaire
   */
  private static drawRecipientInfo(doc: PDFKit.PDFDocument, user: any): void {
    const centerX = doc.page.width / 2;
    
    doc.fillColor(CERTIFICATE_COLORS.textDark)
       .fontSize(14)
       .font('Helvetica')
       .text('Décerné à', centerX, 230, { align: 'center' });
    
    doc.fillColor(CERTIFICATE_COLORS.primary)
       .fontSize(28)
       .font('Helvetica-Bold')
       .text(`${user.prenom} ${user.nom}`, centerX, 260, { align: 'center' });
    
    // Ligne décorative sous le nom
    doc.strokeColor(CERTIFICATE_COLORS.secondary)
       .lineWidth(2)
       .moveTo(centerX - 100, 300)
       .lineTo(centerX + 100, 300)
       .stroke();
  }

  /**
   * Dessine les informations du cours
   */
  private static drawCourseInfo(doc: PDFKit.PDFDocument, cours: ICours): void {
    const centerX = doc.page.width / 2;
    
    doc.fillColor(CERTIFICATE_COLORS.textDark)
       .fontSize(14)
       .font('Helvetica')
       .text('Pour avoir suivi et validé avec succès le cours', centerX, 340, { align: 'center' });
    
    doc.fillColor(CERTIFICATE_COLORS.accent)
       .fontSize(20)
       .font('Helvetica-Bold')
       .text(`"${cours.titre}"`, centerX, 370, { align: 'center' });
    
    if (cours.niveau) {
      doc.fillColor(CERTIFICATE_COLORS.textLight)
         .fontSize(12)
         .font('Helvetica')
         .text(`Niveau : ${cours.niveau}`, centerX, 400, { align: 'center' });
    }
  }

  /**
   * Dessine les détails du certificat
   */
  private static drawCertificateDetails(doc: PDFKit.PDFDocument, certificat: CertificatAvecCours): void {
    const centerX = doc.page.width / 2;
    
    doc.fillColor(CERTIFICATE_COLORS.textDark)
       .fontSize(11)
       .font('Helvetica')
       .text(`Date d'émission : ${new Date(certificat.dateEmission).toLocaleDateString('fr-FR', {
         year: 'numeric',
         month: 'long',
         day: 'numeric'
       })}`, centerX, 450, { align: 'center' });
    
    if (certificat.numero) {
      doc.fillColor(CERTIFICATE_COLORS.textLight)
         .fontSize(10)
         .font('Helvetica-Oblique')
         .text(`N° ${certificat.numero}`, centerX, 470, { align: 'center' });
    }
  }

  /**
   * Dessine le pied de page avec signature
   */
  private static drawFooter(doc: PDFKit.PDFDocument): void {
    const centerX = doc.page.width / 2;
    
    // Ligne de signature
    doc.strokeColor(CERTIFICATE_COLORS.textLight)
       .lineWidth(1)
       .moveTo(centerX - 100, 520)
       .lineTo(centerX + 100, 520)
       .stroke();
    
    doc.fillColor(CERTIFICATE_COLORS.textDark)
       .fontSize(10)
       .font('Helvetica')
       .text('Signature du Directeur', centerX, 530, { align: 'center' });
    
    // Footer
    doc.fillColor(CERTIFICATE_COLORS.textLight)
       .fontSize(9)
       .font('Helvetica')
       .text('Youth Computing - Association Loi 1901 - www.youth-computing.org', centerX, 570, { align: 'center' });
  }

  /**
   * Génère un PDF simple pour le certificat (méthode de secours)
   */
  private static async generateCertificatePDF(user: any, cours: ICours): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
      const buffers: Buffer[] = [];
      
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Version simplifiée mais professionnelle
      doc.fillColor(CERTIFICATE_COLORS.primary)
         .fontSize(30)
         .font('Helvetica-Bold')
         .text('CERTIFICAT DE RÉUSSITE', 150, 100, { align: 'center' });
      
      doc.fillColor(CERTIFICATE_COLORS.textDark)
         .fontSize(18)
         .font('Helvetica')
         .text(`Délivré à : ${user.prenom} ${user.nom}`, 150, 200);
      
      doc.text(`Pour le cours : ${cours.titre}`, 150, 230);
      
      if (cours.niveau) {
        doc.text(`Niveau : ${cours.niveau}`, 150, 260);
      }
      
      doc.text(`Date d'émission : ${new Date().toLocaleDateString('fr-FR')}`, 150, 290);
      doc.text('Youth Computing - Association pour la formation numérique', 150, 350, { align: 'center' });
      
      doc.end();
    });
  }

  /**
   * Méthode utilitaire pour vérifier l'intégrité d'un certificat
   */
  static async verifierIntegriteCertificat(certificatId: string | Types.ObjectId): Promise<{
    certificatExiste: boolean;
    coursExiste: boolean;
    utilisateurExiste: boolean;
    message: string;
  }> {
    try {
      const certificat = await Certificat.findById(certificatId)
        .populate<{ cours: ICours }>('cours')
        .exec();

      if (!certificat) {
        return {
          certificatExiste: false,
          coursExiste: false,
          utilisateurExiste: false,
          message: 'Certificat non trouvé'
        };
      }

      const cours = await Cours.findById(certificat.cours).exec();
      const utilisateur = await User.findById(certificat.apprenant).exec();

      return {
        certificatExiste: true,
        coursExiste: !!cours,
        utilisateurExiste: !!utilisateur,
        message: cours && utilisateur 
          ? 'Certificat valide' 
          : `Problèmes détectés: ${!cours ? 'Cours manquant' : ''} ${!utilisateur ? 'Utilisateur manquant' : ''}`
      };

    } catch (error) {
      logger.error('Erreur lors de la vérification d\'intégrité du certificat', { certificatId, error });
      throw error;
    }
  }
}

export default CertificationService;