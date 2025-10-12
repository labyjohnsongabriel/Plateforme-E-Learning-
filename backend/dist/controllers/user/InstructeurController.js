"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.getCoursesInProgress = exports.submitForApproval = exports.updateCourse = exports.createCourse = exports.getCourses = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const mongoose_1 = require("mongoose");
const User_1 = require("../../models/user/User");
const Cours_1 = __importDefault(require("../../models/course/Cours"));
const types_1 = require("../../types");
/**
 * Contrôleur pour gérer les fonctionnalités des instructeurs.
 */
class InstructeurController {
}
_a = InstructeurController;
/**
 * Récupère les cours créés par un instructeur.
 */
InstructeurController.getCourses = async (req, res, next) => {
    try {
        const { id } = req.params;
        const instructeur = await User_1.User.findById(id)
            .populate('coursCrees', 'titre niveau domaineId statutApprobation')
            .lean();
        if (!instructeur || instructeur.role !== types_1.RoleUtilisateur.ENSEIGNANT) {
            throw (0, http_errors_1.default)(404, 'Instructeur non trouvé');
        }
        res.json({
            success: true,
            data: instructeur.coursCrees,
            message: 'Cours récupérés avec succès',
        });
    }
    catch (err) {
        console.error('Erreur lors de la récupération des cours:', err.message);
        next(err);
    }
};
/**
 * Crée un nouveau cours pour un instructeur.
 */
InstructeurController.createCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!req.user || (req.user.id !== id && req.user.role !== types_1.RoleUtilisateur.ADMIN)) {
            throw (0, http_errors_1.default)(403, 'Accès non autorisé');
        }
        const { titre, description, duree, domaineId, niveau, contenu, quizzes } = req.body;
        if (!titre || !duree || !domaineId || !niveau) {
            throw (0, http_errors_1.default)(400, 'Les champs titre, durée, domaineId et niveau sont requis');
        }
        // Création du cours
        const cours = await Cours_1.default.create({
            titre,
            description: description || '',
            duree,
            domaineId: new mongoose_1.Types.ObjectId(domaineId),
            createur: new mongoose_1.Types.ObjectId(id),
            niveau,
            contenu: contenu || null,
            quizzes: quizzes || [],
            statutApprobation: 'PENDING',
            estPublie: false,
        });
        // Récupération de l'instructeur
        const instructeur = await User_1.User.findById(id);
        if (!instructeur) {
            throw (0, http_errors_1.default)(404, 'Instructeur non trouvé');
        }
        // ✅ Correction TypeScript ici
        instructeur.coursEnCoursEdition?.push(cours._id);
        await instructeur.save();
        res.status(201).json({
            success: true,
            data: cours,
            message: 'Cours créé avec succès',
        });
    }
    catch (err) {
        next(err);
    }
};
/**
 * Met à jour un cours créé par un instructeur.
 */
InstructeurController.updateCourse = async (req, res, next) => {
    try {
        const { id, courseId } = req.params;
        if (!req.user || (req.user.id !== id && req.user.role !== types_1.RoleUtilisateur.ADMIN)) {
            throw (0, http_errors_1.default)(403, 'Accès non autorisé');
        }
        const { titre, description, duree, domaineId, niveau, contenu, quizzes, statutApprobation, estPublie } = req.body;
        const updates = {};
        if (titre)
            updates.titre = titre;
        if (description)
            updates.description = description;
        if (duree !== undefined)
            updates.duree = duree;
        if (domaineId)
            updates.domaineId = new mongoose_1.Types.ObjectId(domaineId);
        if (niveau)
            updates.niveau = niveau;
        if (contenu)
            updates.contenu = contenu;
        if (quizzes)
            updates.quizzes = quizzes;
        if (statutApprobation)
            updates.statutApprobation = statutApprobation;
        if (estPublie !== undefined)
            updates.estPublie = estPublie;
        const cours = await Cours_1.default.findByIdAndUpdate(new mongoose_1.Types.ObjectId(courseId), { $set: updates }, { new: true, runValidators: true });
        if (!cours) {
            throw (0, http_errors_1.default)(404, 'Cours non trouvé');
        }
        res.json({
            success: true,
            data: cours,
            message: 'Cours mis à jour avec succès',
        });
    }
    catch (err) {
        next(err);
    }
};
/**
 * Soumet un cours pour approbation.
 */
InstructeurController.submitForApproval = async (req, res, next) => {
    try {
        const { id, courseId } = req.params;
        if (!req.user || (req.user.id !== id && req.user.role !== types_1.RoleUtilisateur.ADMIN)) {
            throw (0, http_errors_1.default)(403, 'Accès non autorisé');
        }
        const instructeur = await User_1.User.findById(id);
        if (!instructeur || instructeur.role !== types_1.RoleUtilisateur.ENSEIGNANT) {
            throw (0, http_errors_1.default)(404, 'Instructeur non trouvé');
        }
        const courseIndex = instructeur.coursEnCoursEdition.indexOf(new mongoose_1.Types.ObjectId(courseId));
        if (courseIndex === -1) {
            throw (0, http_errors_1.default)(400, 'Cours non en cours d\'édition');
        }
        instructeur.coursEnCoursEdition.splice(courseIndex, 1);
        instructeur.coursCrees.push(new mongoose_1.Types.ObjectId(courseId));
        await instructeur.save();
        const cours = await Cours_1.default.findByIdAndUpdate(new mongoose_1.Types.ObjectId(courseId), { $set: { statutApprobation: 'PENDING' } }, { new: true });
        if (!cours) {
            throw (0, http_errors_1.default)(404, 'Cours non trouvé');
        }
        res.json({
            success: true,
            data: cours,
            message: 'Cours soumis pour approbation avec succès',
        });
    }
    catch (err) {
        next(err);
    }
};
/**
 * Récupère les cours en cours d'édition par un instructeur.
 */
InstructeurController.getCoursesInProgress = async (req, res, next) => {
    try {
        const { id } = req.params;
        const instructeur = await User_1.User.findById(id)
            .populate('coursEnCoursEdition', 'titre niveau domaineId')
            .lean();
        if (!instructeur || instructeur.role !== types_1.RoleUtilisateur.ENSEIGNANT) {
            throw (0, http_errors_1.default)(404, 'Instructeur non trouvé');
        }
        res.json({
            success: true,
            data: instructeur.coursEnCoursEdition,
            message: 'Cours en cours récupérés avec succès',
        });
    }
    catch (err) {
        next(err);
    }
};
/**
 * Récupère le profil d'un instructeur.
 */
InstructeurController.getProfile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const instructeur = await User_1.User.findById(id)
            .populate('coursCrees coursEnCoursEdition')
            .select('-password')
            .lean();
        if (!instructeur || instructeur.role !== types_1.RoleUtilisateur.ENSEIGNANT) {
            throw (0, http_errors_1.default)(404, 'Instructeur non trouvé');
        }
        res.json({
            success: true,
            data: instructeur,
            message: 'Profil récupéré avec succès',
        });
    }
    catch (err) {
        next(err);
    }
};
// ✅ Export des méthodes individuelles
exports.getCourses = InstructeurController.getCourses;
exports.createCourse = InstructeurController.createCourse;
exports.updateCourse = InstructeurController.updateCourse;
exports.submitForApproval = InstructeurController.submitForApproval;
exports.getCoursesInProgress = InstructeurController.getCoursesInProgress;
exports.getProfile = InstructeurController.getProfile;
//# sourceMappingURL=InstructeurController.js.map