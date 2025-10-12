// src/utils/pdfGenerator.ts (version simplifiée)
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { User } from '../models/user/User';
import Cours from '../models/course/Cours';
import logger from './logger';

export const generateCertificate = async (apprenantId: string, coursData: any): Promise<string> => {
  try {
    const apprenant = await User.findById(apprenantId);
    
    let cours;
    if (typeof coursData === 'string') {
      cours = await Cours.findById(coursData).populate('domaineId', 'nom');
    } else {
      cours = coursData;
    }

    if (!apprenant || !cours) {
      throw new Error('Utilisateur ou cours invalide.');
    }

    const dir = path.join(__dirname, '../../uploads/certificates');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const fileName = `${apprenant._id}-${cours._id}-${Date.now()}.pdf`;
    const filePath = path.join(dir, fileName);

    const doc = new PDFDocument({ 
      size: 'A4', 
      layout: 'landscape'
    });
    
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ===== CONTENU DU CERTIFICAT =====
    
    // En-tête
    doc.fontSize(36)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('CERTIFICAT DE RÉUSSITE', 0, 100, { align: 'center' });

    doc.moveDown(3);

    // Corps du certificat
    doc.fontSize(18)
       .font('Helvetica')
       .fillColor('#374151')
       .text('Ceci certifie que', { align: 'center' });

    doc.moveDown();

    doc.fontSize(28)
       .font('Helvetica-Bold')
       .fillColor('#1e293b')
       .text(`${apprenant.prenom} ${apprenant.nom}`, { align: 'center' });

    doc.moveDown();

    doc.fontSize(16)
       .font('Helvetica')
       .fillColor('#4b5563')
       .text(`a suivi et validé avec succès le cours :`, { align: 'center' });

    doc.moveDown();

    doc.fontSize(22)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text(`"${cours.titre}"`, { align: 'center' });

    doc.moveDown();

    doc.fontSize(14)
       .font('Helvetica')
       .fillColor('#6b7280')
       .text(`Niveau : ${cours.niveau} | Durée : ${cours.duree} heures`, { align: 'center' });

    // Pied de page
    doc.moveDown(6);
    doc.fontSize(12)
       .fillColor('#9ca3af')
       .text(`Date d'émission : ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });

    doc.moveDown();
    doc.fontSize(12)
       .fillColor('#6b7280')
       .text('Youth Computing Platform', { align: 'center' });

    doc.end();

    await new Promise<void>((resolve, reject) => {
      stream.on('finish', () => resolve());
      stream.on('error', (error) => reject(error));
    });

    logger.info(`Certificat généré : ${filePath}`);
    return `/uploads/certificates/${fileName}`;

  } catch (err: any) {
    logger.error(`Erreur lors de la génération du PDF : ${err.message}`);
    throw err;
  }
};