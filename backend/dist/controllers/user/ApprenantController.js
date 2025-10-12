"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const User_1 = require("../../models/user/User");
const InscriptionService_1 = require("../../services/learning/InscriptionService");
const ProgressionService_1 = require("../../services/learning/ProgressionService");
const CertificationService_1 = require("../../services/learning/CertificationService");
/**
 * Contrôleur pour gérer les fonctionnalités des apprenants.
 */
class ApprenantController {
}
_a = ApprenantController;
/**
 * Récupère les progrès d'un apprenant.
 * @param req - Requête Express avec paramètre ID
 * @param res - Réponse Express
 * @param next - Fonction middleware suivante
 */
ApprenantController.getProgress = async (req, res, next) => {
    try {
        const apprenant = await User_1.User.findById(req.params.id)
            .populate('progres', 'pourcentage dateDebut dateFin')
            .lean();
        if (!apprenant || apprenant.role !== 'APPRENANT') {
            throw (0, http_errors_1.default)(404, 'Apprenant non trouvé');
        }
        res.json(apprenant.progres);
    }
    catch (err) {
        console.error('Erreur lors de la récupération des progrès:', err.message);
        next(err);
    }
};
/**
 * Récupère les certificats d'un apprenant.
 * @param req - Requête Express avec paramètre ID
 * @param res - Réponse Express
 * @param next - Fonction middleware suivante
 */
ApprenantController.getCertificates = async (req, res, next) => {
    try {
        const apprenant = await User_1.User.findById(req.params.id)
            .populate('certificats', 'dateEmission urlCertificat')
            .lean();
        if (!apprenant || apprenant.role !== 'APPRENANT') {
            throw (0, http_errors_1.default)(404, 'Apprenant non trouvé');
        }
        res.json(apprenant.certificats);
    }
    catch (err) {
        next(err);
    }
};
/**
 * Inscrit un apprenant à un cours.
 * @param req - Requête Express avec paramètre ID, corps et utilisateur authentifié
 * @param res - Réponse Express
 * @param next - Fonction middleware suivante
 */
ApprenantController.enrollInCourse = async (req, res, next) => {
    try {
        if (!req.user || (req.user.id !== req.params.id && req.user.role !== 'ADMIN')) {
            throw (0, http_errors_1.default)(403, 'Accès non autorisé');
        }
        const { coursId } = req.body;
        const inscription = await InscriptionService_1.InscriptionService.enroll(req.params.id, coursId);
        await ProgressionService_1.ProgressionService.initialize(req.params.id, coursId);
        res.status(201).json(inscription);
    }
    catch (err) {
        next(err);
    }
};
/**
 * Met à jour la progression d'un apprenant pour un cours.
 * @param req - Requête Express avec paramètre ID, corps et utilisateur authentifié
 * @param res - Réponse Express
 * @param next - Fonction middleware suivante
 */
ApprenantController.updateProgress = async (req, res, next) => {
    try {
        if (!req.user || (req.user.id !== req.params.id && req.user.role !== 'ADMIN')) {
            throw (0, http_errors_1.default)(403, 'Accès non autorisé');
        }
        const { coursId, pourcentage } = req.body;
        const progression = await ProgressionService_1.ProgressionService.update(req.params.id, coursId, pourcentage);
        if (pourcentage === 100) {
            const cert = await CertificationService_1.CertificationService.generateIfEligible(progression);
            if (cert) {
                const apprenant = await User_1.User.findById(req.params.id);
                if (apprenant) {
                    apprenant.certificats.push(cert._id);
                    await apprenant.save();
                }
            }
        }
        res.json(progression);
    }
    catch (err) {
        next(err);
    }
};
/**
 * Récupère le profil d'un apprenant.
 * @param req - Requête Express avec paramètre ID
 * @param res - Réponse Express
 * @param next - Fonction middleware suivante
 */
ApprenantController.getProfile = async (req, res, next) => {
    try {
        const apprenant = await User_1.User.findById(req.params.id)
            .populate('progres certificats')
            .select('-motDePasse')
            .lean();
        if (!apprenant || apprenant.role !== 'APPRENANT') {
            throw (0, http_errors_1.default)(404, 'Apprenant non trouvé');
        }
        res.json(apprenant);
    }
    catch (err) {
        next(err);
    }
};
exports.default = ApprenantController;
//# sourceMappingURL=ApprenantController.js.map