"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const StatisticsService = __importStar(require("../../services/report/StatisticsService"));
const UserService = __importStar(require("../../services/user/UserService"));
const CoursService_1 = require("../../services/learning/CoursService");
const types_1 = require("../../types");
/**
 * Contrôleur pour gérer les fonctionnalités administratives.
 */
class AdministrateurController {
}
_a = AdministrateurController;
/** Récupère les statistiques globales */
AdministrateurController.getGlobalStats = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== types_1.RoleUtilisateur.ADMIN) {
            throw (0, http_errors_1.default)(403, 'Accès réservé aux administrateurs');
        }
        const stats = await StatisticsService.getGlobalStats();
        res.json(stats);
    }
    catch (err) {
        next(err);
    }
};
/** Récupère les statistiques d’un utilisateur */
AdministrateurController.getUserStats = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== types_1.RoleUtilisateur.ADMIN) {
            throw (0, http_errors_1.default)(403, 'Accès réservé aux administrateurs');
        }
        const stats = await StatisticsService.getUserStats(req.params.userId);
        res.json(stats);
    }
    catch (err) {
        next(err);
    }
};
/** Récupère les statistiques d’un cours */
AdministrateurController.getCourseStats = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== types_1.RoleUtilisateur.ADMIN) {
            throw (0, http_errors_1.default)(403, 'Accès réservé aux administrateurs');
        }
        const stats = await StatisticsService.getCourseStats(req.params.coursId);
        res.json(stats);
    }
    catch (err) {
        next(err);
    }
};
/** Liste tous les utilisateurs */
AdministrateurController.getAllUsers = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== types_1.RoleUtilisateur.ADMIN) {
            throw (0, http_errors_1.default)(403, 'Accès réservé aux administrateurs');
        }
        const users = await UserService.getAllUsers();
        res.json(users);
    }
    catch (err) {
        next(err);
    }
};
/** Met à jour un utilisateur */
AdministrateurController.updateUser = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== types_1.RoleUtilisateur.ADMIN) {
            throw (0, http_errors_1.default)(403, 'Accès réservé aux administrateurs');
        }
        const updated = await UserService.updateUser(req.params.userId, req.body);
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
};
/** Supprime un utilisateur */
AdministrateurController.deleteUser = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== types_1.RoleUtilisateur.ADMIN) {
            throw (0, http_errors_1.default)(403, 'Accès réservé aux administrateurs');
        }
        await UserService.deleteUser(req.params.userId);
        res.json({ message: 'Utilisateur supprimé avec succès' });
    }
    catch (err) {
        next(err);
    }
};
/** Crée un cours */
AdministrateurController.createCourse = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== types_1.RoleUtilisateur.ADMIN) {
            throw (0, http_errors_1.default)(403, 'Accès réservé aux administrateurs');
        }
        const { titre, description, duree, domaineId, niveau, contenu, quizzes } = req.body;
        if (!titre || !duree || !domaineId || !niveau) {
            throw (0, http_errors_1.default)(400, 'Les champs titre, duree, domaineId et niveau sont requis');
        }
        const course = await CoursService_1.CoursService.createCourse({
            titre,
            description: description ?? '',
            duree,
            domaineId,
            niveau,
            contenu: contenu ?? [],
            quizzes: quizzes ?? [],
            statutApprobation: 'APPROVED',
            estPublie: false,
        }, req.user.id);
        res.status(201).json(course);
    }
    catch (err) {
        next(err);
    }
};
/** Liste tous les cours */
AdministrateurController.getAllCourses = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== types_1.RoleUtilisateur.ADMIN) {
            throw (0, http_errors_1.default)(403, 'Accès réservé aux administrateurs');
        }
        const courses = await CoursService_1.CoursService.getAllCourses();
        res.json(courses);
    }
    catch (err) {
        next(err);
    }
};
/** Met à jour un cours */
AdministrateurController.updateCourse = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== types_1.RoleUtilisateur.ADMIN) {
            throw (0, http_errors_1.default)(403, 'Accès réservé aux administrateurs');
        }
        const { coursId } = req.params;
        const updateData = { ...req.body, coursId };
        const updated = await CoursService_1.CoursService.updateCourse(coursId, updateData);
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
};
/** Supprime un cours */
AdministrateurController.deleteCourse = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== types_1.RoleUtilisateur.ADMIN) {
            throw (0, http_errors_1.default)(403, 'Accès réservé aux administrateurs');
        }
        await CoursService_1.CoursService.deleteCourse(req.params.coursId);
        res.json({ message: 'Cours supprimé avec succès' });
    }
    catch (err) {
        next(err);
    }
};
exports.default = AdministrateurController;
//# sourceMappingURL=AdministrateurController.js.map