"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const User_1 = require("../../models/user/User");
const CoursService_1 = require("../../services/learning/CoursService");
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
        const instructeur = await User_1.User.findById(req.params.id)
            .populate('coursCrees', 'titre niveau domaineId statutApprobation')
            .lean();
        if (!instructeur || instructeur.role !== types_1.RoleUtilisateur.INSTRUCTEUR) {
            throw (0, http_errors_1.default)(404, 'Instructeur non trouvé');
        }
        res.json(instructeur.coursCrees);
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
        if (!req.user || (req.user.id !== req.params.id && req.user.role !== types_1.RoleUtilisateur.ADMIN)) {
            throw (0, http_errors_1.default)(403, 'Accès non autorisé');
        }
        const { titre, description, duree, domaineId, niveau, contenus, quizzes } = req.body;
        if (!titre || !duree || !domaineId || !niveau) {
            throw (0, http_errors_1.default)(400, 'Les champs titre, duree, domaineId et niveau sont requis');
        }
        const instructeurId = req.params.id;
        const cours = await CoursService_1.CoursService.createCourse({
            titre,
            description: description ?? '',
            duree,
            domaineId,
            niveau,
            contenus: contenus ?? [],
            quizzes: quizzes ?? [],
            statutApprobation: 'PENDING',
            estPublie: false,
        }, instructeurId);
        const instructeur = await User_1.User.findById(instructeurId);
        if (instructeur) {
            instructeur.coursEnCoursEdition.push(cours._id);
            await instructeur.save();
        }
        res.status(201).json(cours);
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
        if (!req.user || (req.user.id !== req.params.id && req.user.role !== types_1.RoleUtilisateur.ADMIN)) {
            throw (0, http_errors_1.default)(403, 'Accès non autorisé');
        }
        const { coursId, titre, description, duree, domaineId, niveau, contenus, quizzes, statutApprobation, estPublie } = req.body;
        const instructeurId = req.params.id;
        const updateData = {};
        if (titre !== undefined)
            updateData.titre = titre;
        if (description !== undefined)
            updateData.description = description;
        if (duree !== undefined)
            updateData.duree = duree;
        if (domaineId !== undefined)
            updateData.domaineId = domaineId;
        if (niveau !== undefined)
            updateData.niveau = niveau;
        if (contenus !== undefined)
            updateData.contenus = contenus;
        if (quizzes !== undefined)
            updateData.quizzes = quizzes;
        if (statutApprobation !== undefined)
            updateData.statutApprobation = statutApprobation;
        if (estPublie !== undefined)
            updateData.estPublie = estPublie;
        const cours = await CoursService_1.CoursService.updateCourse(coursId, updateData, instructeurId);
        res.json(cours);
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
        if (!req.user || (req.user.id !== req.params.id && req.user.role !== types_1.RoleUtilisateur.ADMIN)) {
            throw (0, http_errors_1.default)(403, 'Accès non autorisé');
        }
        const { coursId } = req.body;
        const instructeurId = req.params.id;
        const instructeur = await User_1.User.findById(instructeurId);
        if (!instructeur || instructeur.role !== types_1.RoleUtilisateur.INSTRUCTEUR) {
            throw (0, http_errors_1.default)(404, 'Instructeur non trouvé');
        }
        const courseIndex = instructeur.coursEnCoursEdition.indexOf(coursId);
        if (courseIndex === -1) {
            throw (0, http_errors_1.default)(400, 'Cours non en cours d\'édition');
        }
        instructeur.coursEnCoursEdition.splice(courseIndex, 1);
        instructeur.coursCrees.push(coursId);
        await instructeur.save();
        const cours = await CoursService_1.CoursService.updateCourse(coursId, { statutApprobation: 'PENDING' }, instructeurId);
        res.json(cours);
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
        const instructeur = await User_1.User.findById(req.params.id)
            .populate('coursEnCoursEdition', 'titre niveau domaineId')
            .lean();
        if (!instructeur || instructeur.role !== types_1.RoleUtilisateur.INSTRUCTEUR) {
            throw (0, http_errors_1.default)(404, 'Instructeur non trouvé');
        }
        res.json(instructeur.coursEnCoursEdition);
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
        const instructeur = await User_1.User.findById(req.params.id)
            .populate('coursCrees coursEnCoursEdition')
            .select('-motDePasse')
            .lean();
        if (!instructeur || instructeur.role !== types_1.RoleUtilisateur.INSTRUCTEUR) {
            throw (0, http_errors_1.default)(404, 'Instructeur non trouvé');
        }
        res.json(instructeur);
    }
    catch (err) {
        next(err);
    }
};
exports.default = InstructeurController;
//# sourceMappingURL=InstructeurController.js.map