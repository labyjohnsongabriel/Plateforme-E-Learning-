"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const StatisticsService_1 = __importDefault(require("../../services/report/StatisticsService"));
const UserService_1 = __importDefault(require("../../services/user/UserService"));
const CoursService_1 = __importDefault(require("../../services/learning/CoursService"));
/**
 * Contrôleur pour gérer les fonctionnalités administratives.
 */
class AdministrateurController {
}
_a = AdministrateurController;
/**
 * Récupère les statistiques globales du système.
 */
AdministrateurController.getGlobalStats = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== types_1.RoleUtilisateur.ADMIN) {
            throw (0, http_errors_1.default)(403, 'Accès réservé aux administrateurs');
        }
        const stats = await StatisticsService_1.default.getGlobalStats();
        res.json(stats);
    }
    catch (err) {
        console.error('Erreur controller getGlobalStats:', err.message);
        next(err);
    }
};
/**
 * Récupère les statistiques d'un utilisateur spécifique.
 */
AdministrateurController.getUserStats = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== types_1.RoleUtilisateur.ADMIN) {
            throw (0, http_errors_1.default)(403, 'Accès réservé aux administrateurs');
        }
        const stats = await StatisticsService_1.default.getUserStats(req.params.userId);
        res.json(stats);
    }
    catch (err) {
        next(err);
    }
};
/**
 * Récupère les statistiques d'un cours spécifique.
 */
AdministrateurController.getCourseStats = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== types_1.RoleUtilisateur.ADMIN) {
            throw (0, http_errors_1.default)(403, 'Accès réservé aux administrateurs');
        }
        const stats = await StatisticsService_1.default.getCourseStats(req.params.coursId);
        res.json(stats);
    }
    catch (err) {
        next(err);
    }
};
/**
 * Récupère tous les utilisateurs.
 */
AdministrateurController.getAllUsers = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== types_1.RoleUtilisateur.ADMIN) {
            throw (0, http_errors_1.default)(403, 'Accès réservé aux administrateurs');
        }
        const users = await UserService_1.default.getAllUsers();
        res.json(users);
    }
    catch (err) {
        next(err);
    }
};
/**
 * Met à jour un utilisateur.
 */
AdministrateurController.updateUser = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== types_1.RoleUtilisateur.ADMIN) {
            throw (0, http_errors_1.default)(403, 'Accès réservé aux administrateurs');
        }
        const updated = await UserService_1.default.updateUser(req.params.userId, req.body);
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
};
/**
 * Supprime un utilisateur.
 */
AdministrateurController.deleteUser = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== types_1.RoleUtilisateur.ADMIN) {
            throw (0, http_errors_1.default)(403, 'Accès réservé aux administrateurs');
        }
        await UserService_1.default.deleteUser(req.params.userId);
        res.json({ message: 'Utilisateur supprimé' });
    }
    catch (err) {
        next(err);
    }
};
/**
 * Crée un nouveau cours.
 */
AdministrateurController.createCourse = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== types_1.RoleUtilisateur.ADMIN) {
            throw (0, http_errors_1.default)(403, 'Accès réservé aux administrateurs');
        }
        const { titre, description, duree, domaineId, niveau, contenus, quizzes } = req.body;
        if (!titre || !duree || !domaineId || !niveau) {
            throw (0, http_errors_1.default)(400, 'Les champs titre, duree, domaineId et niveau sont requis');
        }
        const course = await CoursService_1.default.createCourse({
            titre,
            description: description ?? '',
            duree,
            domaineId,
            niveau,
            contenus: contenus ?? [],
            quizzes: quizzes ?? [],
            statutApprobation: 'APPROVED', // Les cours créés par un admin sont automatiquement approuvés
            estPublie: false,
        }, req.user.id);
        res.status(201).json(course);
    }
    catch (err) {
        next(err);
    }
};
/**
 * Récupère tous les cours.
 */
AdministrateurController.getAllCourses = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== types_1.RoleUtilisateur.ADMIN) {
            throw (0, http_errors_1.default)(403, 'Accès réservé aux administrateurs');
        }
        const courses = await CoursService_1.default.getAllCourses();
        res.json(courses);
    }
    catch (err) {
        next(err);
    }
};
/**
 * Met à jour un cours.
 */
AdministrateurController.updateCourse = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== types_1.RoleUtilisateur.ADMIN) {
            throw (0, http_errors_1.default)(403, 'Accès réservé aux administrateurs');
        }
        const { coursId } = req.params;
        const { titre, description, duree, domaineId, niveau, contenus, quizzes, statutApprobation, estPublie } = req.body;
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
        const updated = await CoursService_1.default.updateCourse(coursId, updateData);
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
};
/**
 * Supprime un cours.
 */
AdministrateurController.deleteCourse = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== types_1.RoleUtilisateur.ADMIN) {
            throw (0, http_errors_1.default)(403, 'Accès réservé aux administrateurs');
        }
        await CoursService_1.default.deleteCourse(req.params.coursId);
        res.json({ message: 'Cours supprimé' });
    }
    catch (err) {
        next(err);
    }
};
exports.default = AdministrateurController;
//# sourceMappingURL=AdministrateurController.js.map