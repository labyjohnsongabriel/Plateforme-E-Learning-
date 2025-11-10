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
  cours: ICours | null;
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

// Interface pour le cours par défaut
interface CoursParDefaut {
  _id: Types.ObjectId;
  titre: string;
  niveau: NiveauFormation;
  description: string;
  duree: string;
  estPublic: boolean;
  prix: number;
  langues: string[];
  prerequis: string[];
  objectifs: string[];
  competences: string[];
  planCours: any[];
  imageUrl: string;
  formateur: Types.ObjectId;
  categories: Types.ObjectId[];
  estActif: boolean;
  dateCreation: Date;
  dateModification: Date;
}

// Fonction pour créer un cours par défaut
const creerCoursParDefaut = (): CoursParDefaut => ({
  _id: new Types.ObjectId('000000000000000000000000'),
  titre: 'Formation Youth Computing',
  niveau: NiveauFormation.BETA,
  description: 'Certificat de complétion de formation',
  duree: 'Variable',
  estPublic: true,
  prix: 0,
  langues: ['fr'],
  prerequis: [],
  objectifs: ['Complétion réussie de la formation'],
  competences: [],
  planCours: [],
  imageUrl: '',
  formateur: new Types.ObjectId('000000000000000000000000'),
  categories: [],
  estActif: true,
  dateCreation: new Date(),
  dateModification: new Date()
});

export class CertificationService {
  /**
   * Génère un certificat si l'utilisateur est éligible (70% ou plus)
   */
  static async generateIfEligible(progression: IProgression): Promise<ICertificat | null> {
    try {
      // Validation des données requises
      if (!progression.apprenant || !progression.cours) {
        logger.error('❌ Données manquantes pour génération certificat', {
          apprenant: progression.apprenant,
          cours: progression.cours,
          progressionId: progression._id
        });
        return null;
      }

      // Vérification de l'éligibilité (70% ou plus et date de fin définie)
      const pourcentageMinimum = 70;
      if (progression.pourcentage < pourcentageMinimum || !progression.dateFin) {
        logger.info(`Progression non éligible pour certificat: apprenant=${progression.apprenant}, cours=${progression.cours}, pourcentage=${progression.pourcentage}%`);
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
      const [cours, user] = await Promise.all([
        Cours.findById(progression.cours).exec(),
        User.findById(progression.apprenant).exec()
      ]);
      
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
      
      // Création du certificat en base de données avec code unique
      const cert = new Certificat({
        apprenant: progression.apprenant,
        cours: progression.cours,
        dateEmission: new Date(),
        urlCertificat: url,
        valide: true,
        codeCertificat: `YC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
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
        .populate<{ cours: ICours }>('cours', 'titre niveau description duree')
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

      // Récupération du certificat avec populate
      const certificat = await Certificat.findOne({
        _id: certificatId,
        apprenant: apprenantId,
      }).populate<{ cours: ICours }>('cours').exec();

      if (!certificat) {
        logger.error('❌ Certificat non trouvé', { certificatId, apprenantId });
        throw new Error('Certificat non trouvé');
      }

      const user = await User.findById(apprenantId).exec();
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      let cours: ICours | CoursParDefaut;
      
      // Gestion robuste du cours - vérification approfondie
      if (!certificat.cours || certificat.cours === null) {
        logger.warn('⚠️ Cours null ou manquant dans le certificat', {
          certificatId,
          apprenantId,
          coursId: certificat.cours
        });
        
        // Si le cours est null, essayer de récupérer le cours original depuis la progression
        const progression = await this.trouverProgressionParCertificat(certificat._id);
        if (progression && progression.cours) {
          const coursDirect = await Cours.findById(progression.cours).exec();
          if (coursDirect) {
            cours = coursDirect;
            logger.info('✅ Cours récupéré depuis la progression');
          } else {
            cours = creerCoursParDefaut();
            logger.info('ℹ️ Utilisation du cours par défaut');
          }
        } else {
          cours = creerCoursParDefaut();
          logger.info('ℹ️ Utilisation du cours par défaut (progression non trouvée)');
        }
      } else {
        // Vérifier que le cours peuplé est valide
        if (typeof certificat.cours === 'object' && certificat.cours !== null) {
          cours = certificat.cours as ICours;
        } else {
          // Si le cours peuplé est invalide, utiliser le cours par défaut
          cours = creerCoursParDefaut();
          logger.warn('⚠️ Cours peuplé invalide, utilisation du cours par défaut');
        }
      }

      // Conversion en CertificatAvecCours
      const certificatAvecCours: CertificatAvecCours = {
        ...certificat.toObject(),
        cours: cours as ICours
      };

      // Génération du PDF professionnel
      return await this.generateProfessionalCertificate({
        certificat: certificatAvecCours,
        cours: cours as ICours,
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
   * Génère un PDF simple pour le certificat (méthode de secours)
   */
  private static async generateCertificatePDF(user: any, cours: ICours | CoursParDefaut): Promise<Buffer> {
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
         .text('CERTIFICAT DE RÉUSSITE', 0, 100, { align: 'center' });
      
      const nomComplet = user?.prenom && user?.nom 
        ? `${user.prenom} ${user.nom}`
        : user?.prenom || user?.nom || 'Récipiendaire';
      
      const titreCours = cours?.titre || 'Formation Youth Computing';
      
      doc.fillColor(CERTIFICATE_COLORS.textDark)
         .fontSize(18)
         .font('Helvetica')
         .text(`Délivré à : ${nomComplet}`, 150, 200);
      
      doc.text(`Pour le cours : ${titreCours}`, 150, 230);
      
      if (cours?.niveau) {
        doc.text(`Niveau : ${cours.niveau}`, 150, 260);
      }
      
      doc.text(`Date d'émission : ${new Date().toLocaleDateString('fr-FR')}`, 150, 290);
      doc.text('Youth Computing - Association pour la formation numérique', 0, 350, { align: 'center' });
      
      doc.end();
    });
  }

  /**
   * Génère un PDF de certificat professionnel
   */
  private static async generateProfessionalCertificate(data: CertificatData): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
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
        this.drawHeader(doc);

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
    const width = doc.page.width;
    const height = doc.page.height;
    
    const gradient = doc.linearGradient(0, 0, width, height);
    gradient.stop(0, CERTIFICATE_COLORS.lightBg);
    gradient.stop(1, '#FFFFFF');
    
    doc.rect(0, 0, width, height)
       .fill(gradient);

    // Bordure décorative
    doc.strokeColor(CERTIFICATE_COLORS.gold)
       .lineWidth(8)
       .roundedRect(20, 20, width - 40, height - 40, 10)
       .stroke();

    // Motif de fond subtil
    doc.save();
    doc.fillColor(CERTIFICATE_COLORS.primary);
    (doc as any).opacity(0.03);
    
    for (let i = 0; i < width; i += 80) {
      for (let j = 0; j < height; j += 80) {
        doc.text('✓', i, j);
      }
    }
    
    doc.restore();
  }

  /**
   * Dessine l'en-tête avec logo
   */
  private static drawHeader(doc: PDFKit.PDFDocument): void {
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
         align: 'center'
       });
    
    // Ligne décorative colorée sous le titre
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
    
    // Gestion des noms d'utilisateur manquants
    const nomComplet = user?.prenom && user?.nom 
      ? `${user.prenom} ${user.nom}`
      : user?.prenom || user?.nom || 'Récipiendaire';
    
    doc.fillColor(CERTIFICATE_COLORS.primary)
       .fontSize(28)
       .font('Helvetica-Bold')
       .text(nomComplet, centerX, 260, { align: 'center' });
    
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
  private static drawCourseInfo(doc: PDFKit.PDFDocument, cours: ICours | CoursParDefaut): void {
    const centerX = doc.page.width / 2;
    
    doc.fillColor(CERTIFICATE_COLORS.textDark)
       .fontSize(14)
       .font('Helvetica')
       .text('Pour avoir suivi et validé avec succès le cours', centerX, 340, { align: 'center' });
    
    // Gestion du titre de cours manquant
    const titreCours = cours?.titre || 'Formation Youth Computing';
    
    doc.fillColor(CERTIFICATE_COLORS.accent)
       .fontSize(20)
       .font('Helvetica-Bold')
       .text(`"${titreCours}"`, centerX, 370, { align: 'center' });
    
    if (cours?.niveau) {
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
    
    // Gestion de la date d'émission
    const dateEmission = certificat.dateEmission 
      ? new Date(certificat.dateEmission).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : new Date().toLocaleDateString('fr-FR');
    
    doc.fillColor(CERTIFICATE_COLORS.textDark)
       .fontSize(11)
       .font('Helvetica')
       .text(`Date d'émission : ${dateEmission}`, centerX, 450, { align: 'center' });
    
    // Gestion du code de certificat
    const codeCertificat = certificat.codeCertificat || certificat._id?.toString().slice(-8) || 'YC-' + Date.now().toString().slice(-6);
    
    doc.fillColor(CERTIFICATE_COLORS.textLight)
       .fontSize(10)
       .font('Helvetica-Oblique')
       .text(`N° ${codeCertificat}`, centerX, 470, { align: 'center' });
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
   * Trouve la progression associée à un certificat
   */
  private static async trouverProgressionParCertificat(certificatId: Types.ObjectId | string): Promise<any> {
    try {
      const Progression = (await import('../../models/learning/Progression')).default;
      const certificat = await Certificat.findById(certificatId).exec();
      
      if (!certificat) return null;

      return await Progression.findOne({
        apprenant: certificat.apprenant,
        cours: certificat.cours
      }).exec();
    } catch (error) {
      logger.error('Erreur lors de la recherche de progression', { certificatId, error });
      return null;
    }
  }

  /**
   * Corrige les certificats avec cours null en leur assignant un cours valide
   */
  static async corrigerCertificatsAvecCoursNull(): Promise<{ corriges: number; total: number }> {
    try {
      // Trouver tous les certificats avec cours null ou non existant
      const certificatsProblematiques = await Certificat.find({
        $or: [
          { cours: { $in: [null, undefined] } },
          { cours: { $exists: false } }
        ]
      }).exec();

      logger.info(`🔧 Correction de ${certificatsProblematiques.length} certificats avec cours null`);

      let corriges = 0;

      for (const certificat of certificatsProblematiques) {
        try {
          // Trouver la progression associée pour récupérer le cours original
          const progression = await this.trouverProgressionParCertificat(certificat._id);
          
          if (progression && progression.cours) {
            // Assigner le cours de la progression
            certificat.cours = progression.cours;
            await certificat.save();
            corriges++;
            logger.info(`✅ Certificat ${certificat._id} corrigé avec cours: ${progression.cours}`);
          } else {
            // Si pas de progression, trouver un cours actif quelconque
            const coursActif = await Cours.findOne({ estPublie: true }).exec();
            if (coursActif) {
              certificat.cours = coursActif._id;
              await certificat.save();
              corriges++;
              logger.info(`✅ Certificat ${certificat._id} corrigé avec cours actif: ${coursActif.titre}`);
            } else {
              logger.warn(`⚠️ Impossible de corriger le certificat ${certificat._id}: aucun cours actif trouvé`);
            }
          }
        } catch (error) {
          logger.error(`❌ Erreur correction certificat ${certificat._id}:`, error);
        }
      }

      return {
        corriges,
        total: certificatsProblematiques.length
      };

    } catch (error) {
      logger.error('Erreur lors de la correction des certificats avec cours null', error);
      throw error;
    }
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
      const certificat = await Certificat.findById(certificatId).exec();

      if (!certificat) {
        return {
          certificatExiste: false,
          coursExiste: false,
          utilisateurExiste: false,
          message: 'Certificat non trouvé'
        };
      }

      const [cours, utilisateur] = await Promise.all([
        Cours.findById(certificat.cours).exec(),
        User.findById(certificat.apprenant).exec()
      ]);

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

  /**
   * Script de migration pour corriger tous les certificats problématiques
   */
  static async migrationCorrectionCertificats(): Promise<void> {
    try {
      logger.info('🚀 Début de la migration de correction des certificats');
      
      // 1. Corriger les certificats avec cours null
      const resultatNull = await this.corrigerCertificatsAvecCoursNull();
      
      // 2. Vérifier l'intégrité de tous les certificats
      const tousCertificats = await Certificat.find().exec();
      let certificatsValides = 0;
      let certificatsInvalides = 0;

      for (const cert of tousCertificats) {
        const integrite = await this.verifierIntegriteCertificat(cert._id);
        if (integrite.certificatExiste && integrite.coursExiste && integrite.utilisateurExiste) {
          certificatsValides++;
        } else {
          certificatsInvalides++;
          logger.warn(`Certificat invalide détecté: ${cert._id}`, integrite);
        }
      }

      logger.info('📊 Rapport de migration des certificats:', {
        totalCertificats: tousCertificats.length,
        certificatsValides,
        certificatsInvalides,
        certificatsAvecCoursNullCorriges: resultatNull.corriges
      });

    } catch (error) {
      logger.error('❌ Erreur lors de la migration des certificats', error);
      throw error;
    }
  }
}

export default CertificationService;