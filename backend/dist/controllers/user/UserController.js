"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../../models/user/User"); // Fixed import syntax
const UserService_1 = require("../../services/user/UserService"); // Correct import path
/**
 * Service pour gérer les apprenants.
 */
class ApprenantService {
    static async getProgress(id) {
        const apprenant = await User_1.Apprenant.findById(id);
        if (!apprenant)
            throw (0, http_errors_1.default)(404, 'Apprenant non trouvé');
        return await apprenant.visualiserProgres();
    }
    static async getCertificats(id) {
        return await mongoose_1.default.model('Certificat').find({ utilisateur: id });
    }
}
/**
 * Service pour gérer les administrateurs.
 */
class AdministrateurService {
    static async gererUtilisateurs() {
        const admin = await User_1.Administrateur.findOne();
        if (!admin)
            throw (0, http_errors_1.default)(403, 'Accès non autorisé');
        return await admin.gererUtilisateurs();
    }
    static async genererStatistiques() {
        const admin = await User_1.Administrateur.findOne();
        if (!admin)
            throw (0, http_errors_1.default)(403, 'Accès non autorisé');
        return await admin.genererStatistiques();
    }
}
/**
 * Contrôleur pour gérer les utilisateurs.
 */
class UserController {
}
exports.UserController = UserController;
_a = UserController;
UserController.getAll = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            throw (0, http_errors_1.default)(403, 'Accès réservé aux administrateurs');
        }
        const users = await UserService_1.UserService.getAllUsers();
        res.json(users);
    }
    catch (err) {
        next(err);
    }
};
UserController.getById = async (req, res, next) => {
    try {
        if (!req.user || (req.user.id !== req.params.id && req.user.role !== 'ADMIN')) {
            throw (0, http_errors_1.default)(403, 'Accès non autorisé');
        }
        const user = await UserService_1.UserService.getById(req.params.id);
        res.json(user);
    }
    catch (err) {
        next(err);
    }
};
UserController.update = async (req, res, next) => {
    try {
        if (!req.user || (req.user.id !== req.params.id && req.user.role !== 'ADMIN')) {
            throw (0, http_errors_1.default)(403, 'Accès non autorisé');
        }
        const user = await UserService_1.UserService.updateUser(req.params.id, req.body);
        res.json(user);
    }
    catch (err) {
        next(err);
    }
};
UserController.delete = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            throw (0, http_errors_1.default)(403, 'Accès réservé aux administrateurs');
        }
        await UserService_1.UserService.deleteUser(req.params.id);
        res.json({ message: 'Utilisateur supprimé' });
    }
    catch (err) {
        next(err);
    }
};
//# sourceMappingURL=UserController.js.map