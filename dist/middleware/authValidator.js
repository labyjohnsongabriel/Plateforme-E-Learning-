"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewUsers = exports.getInactiveUsers = exports.getActiveUsers = exports.getUserStatistics = exports.deleteProfile = exports.changeProfilePicture = exports.updateProfile = exports.getProfile = exports.sort = exports.filter = exports.search = exports.getAll = exports.getById = exports.deleteSchema = exports.setNewPassword = exports.resetPassword = exports.changePassword = exports.update = exports.login = exports.register = void 0;
// src/validations/authValidation.ts
const joi_1 = __importDefault(require("joi"));
exports.register = joi_1.default.object({
    nom: joi_1.default.string().required(),
    prenom: joi_1.default.string().required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
    role: joi_1.default.string().required(),
});
exports.login = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
});
exports.update = joi_1.default.object({
    nom: joi_1.default.string(),
    prenom: joi_1.default.string(),
});
exports.changePassword = joi_1.default.object({
    ancienMotDePasse: joi_1.default.string().required(),
    nouveauMotDePasse: joi_1.default.string().min(6).required(),
});
exports.resetPassword = joi_1.default.object({
    email: joi_1.default.string().email().required(),
});
exports.setNewPassword = joi_1.default.object({
    token: joi_1.default.string().required(),
    nouveauMotDePasse: joi_1.default.string().min(6).required(),
});
exports.deleteSchema = joi_1.default.object({
    motDePasse: joi_1.default.string().required(),
});
exports.getById = joi_1.default.object({
    id: joi_1.default.string().hex().length(24).required(),
});
exports.getAll = joi_1.default.object({
    page: joi_1.default.number().min(1),
    limit: joi_1.default.number().min(1).max(100),
});
exports.search = joi_1.default.object({
    query: joi_1.default.string().required(),
    page: joi_1.default.number().min(1),
    limit: joi_1.default.number().min(1).max(100),
});
exports.filter = joi_1.default.object({
    role: joi_1.default.string(),
    dateInscription: joi_1.default.date(),
    dernierConnexion: joi_1.default.date(),
    page: joi_1.default.number().min(1),
    limit: joi_1.default.number().min(1).max(100),
});
exports.sort = joi_1.default.object({
    sortBy: joi_1.default.string().valid('nom', 'prenom', 'email', 'dateInscription', 'dernierConnexion'),
    order: joi_1.default.string().valid('asc', 'desc'),
    page: joi_1.default.number().min(1),
    limit: joi_1.default.number().min(1).max(100),
});
exports.getProfile = joi_1.default.object({});
exports.updateProfile = joi_1.default.object({
    nom: joi_1.default.string(),
    prenom: joi_1.default.string(),
});
exports.changeProfilePicture = joi_1.default.object({});
exports.deleteProfile = joi_1.default.object({
    motDePasse: joi_1.default.string().required(),
});
exports.getUserStatistics = joi_1.default.object({
    startDate: joi_1.default.date(),
    endDate: joi_1.default.date(),
});
exports.getActiveUsers = joi_1.default.object({
    days: joi_1.default.number().min(1).required(),
});
exports.getInactiveUsers = joi_1.default.object({
    days: joi_1.default.number().min(1).required(),
});
exports.getNewUsers = joi_1.default.object({
    days: joi_1.default.number().min(1).required(),
});
//# sourceMappingURL=authValidator.js.map