"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCertificate = void 0;
// src/utils/pdfGenerator.ts (version simplifiée)
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const User_1 = require("../models/user/User");
const Cours_1 = __importDefault(require("../models/course/Cours"));
const logger_1 = __importDefault(require("./logger"));
const generateCertificate = async (apprenantId, coursData) => {
    try {
        const apprenant = await User_1.User.findById(apprenantId);
        let cours;
        if (typeof coursData === 'string') {
            cours = await Cours_1.default.findById(coursData).populate('domaineId', 'nom');
        }
        else {
            cours = coursData;
        }
        if (!apprenant || !cours) {
            throw new Error('Utilisateur ou cours invalide.');
        }
        const dir = path_1.default.join(__dirname, '../../uploads/certificates');
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        const fileName = `${apprenant._id}-${cours._id}-${Date.now()}.pdf`;
        const filePath = path_1.default.join(dir, fileName);
        const doc = new pdfkit_1.default({
            size: 'A4',
            layout: 'landscape'
        });
        const stream = fs_1.default.createWriteStream(filePath);
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
        await new Promise((resolve, reject) => {
            stream.on('finish', () => resolve());
            stream.on('error', (error) => reject(error));
        });
        logger_1.default.info(`Certificat généré : ${filePath}`);
        return `/uploads/certificates/${fileName}`;
    }
    catch (err) {
        logger_1.default.error(`Erreur lors de la génération du PDF : ${err.message}`);
        throw err;
    }
};
exports.generateCertificate = generateCertificate;
//# sourceMappingURL=pdfGenerator.js.map