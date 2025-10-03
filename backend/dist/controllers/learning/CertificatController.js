"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const http_errors_1 = __importDefault(require("http-errors"));
const mongoose_1 = __importDefault(require("mongoose"));
const Certificat_1 = require("../../models/learning/Certificat");
const User_1 = require("../../models/user/User");
const Cours_1 = require("../../models/course/Cours");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const types_1 = require("../../types");
/**
 * Contrôleur pour gérer les certificats.
 */
class CertificatController {
}
_a = CertificatController;
/**
 * Récupère tous les certificats d'un utilisateur authentifié.
 * @param req - Requête Express avec utilisateur authentifié
 * @param res - Réponse Express
 * @param next - Fonction middleware suivante
 */
CertificatController.getByUser = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        }
        const certs = await Certificat_1.Certificat.find({ apprenant: req.user.id }).populate('cours', 'titre niveau');
        res.json(certs.length ? certs : []);
    }
    catch (err) {
        console.error('Erreur lors de la récupération des certificats:', err.message);
        next(err);
    }
};
/**
 * Télécharge un certificat PDF.
 * @param req - Requête Express avec paramètre ID
 * @param res - Réponse Express
 * @param next - Fonction middleware suivante
 */
CertificatController.download = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        }
        const cert = await Certificat_1.Certificat.findOne({ _id: req.params.id, apprenant: req.user.id });
        if (!cert) {
            throw (0, http_errors_1.default)(404, 'Certificat non trouvé ou non autorisé');
        }
        const filePath = path_1.default.join(__dirname, '../../public', cert.urlCertificat);
        if (!fs_1.default.existsSync(filePath)) {
            throw (0, http_errors_1.default)(404, 'Fichier du certificat non trouvé');
        }
        res.download(filePath, `certificat_${cert._id}.pdf`);
    }
    catch (err) {
        console.error('Erreur lors du téléchargement du certificat:', err.message);
        next(err);
    }
};
/**
 * Génère un certificat PDF pour un utilisateur et un cours.
 * @param apprenantId - ID de l'utilisateur
 * @param coursId - ID du cours
 * @returns Le certificat créé ou existant, ou null si le niveau est Alfa
 */
CertificatController.generateCertificate = async (apprenantId, coursId) => {
    try {
        const existingCert = await Certificat_1.Certificat.findOne({ apprenant: apprenantId, cours: coursId });
        if (existingCert) {
            return existingCert;
        }
        const user = await User_1.User.findById(apprenantId);
        const cours = await Cours_1.Cours.findById(coursId);
        if (!user || !cours) {
            throw new Error('Utilisateur ou cours non trouvé');
        }
        const levels = ['Alfa', 'Bêta', 'Gamma', 'Delta'];
        const levelIndex = levels.indexOf(cours.niveau);
        if (levelIndex < 1) {
            return null;
        }
        const doc = new pdfkit_1.default({ size: 'A4', layout: 'landscape' });
        const filename = `certificat_${apprenantId}_${coursId}.pdf`;
        const dir = path_1.default.join(__dirname, '../../public/certificates');
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        const filePath = path_1.default.join(dir, filename);
        doc.pipe(fs_1.default.createWriteStream(filePath));
        // Contenu du PDF
        try {
            doc.image(path_1.default.join(__dirname, '../../public/logo-youth-computing.png'), 50, 50, { width: 100 });
        }
        catch (imgErr) {
            console.warn('Logo non trouvé, génération sans logo:', imgErr.message);
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
        const newCert = new Certificat_1.Certificat({
            apprenant: apprenantId,
            cours: coursId,
            dateEmission: new Date(),
            urlCertificat: url,
        });
        await newCert.save();
        return newCert;
    }
    catch (err) {
        console.error('Erreur lors de la génération du certificat:', err.message);
        throw err;
    }
};
exports.default = CertificatController;
//# sourceMappingURL=CertificatController.js.map