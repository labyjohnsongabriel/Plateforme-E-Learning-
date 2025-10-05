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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdminController = __importStar(require("../controllers/user/AdministrateurController"));
const auth_1 = __importDefault(require("../middleware/auth"));
const authorize_1 = __importDefault(require("../middleware/authorize"));
const RoleUtilisateur_1 = require("../../src//models/enums/RoleUtilisateur"); // Mise à jour pour utiliser types/index.ts
const router = (0, express_1.Router)();
// Stats
router.get('/stats/global', auth_1.default, (0, authorize_1.default)([RoleUtilisateur_1.RoleUtilisateur.ADMIN]), AdminController.getGlobalStats);
router.get('/stats/user/:userId', auth_1.default, (0, authorize_1.default)([RoleUtilisateur_1.RoleUtilisateur.ADMIN]), AdminController.getUserStats);
router.get('/stats/course/:coursId', auth_1.default, (0, authorize_1.default)([RoleUtilisateur_1.RoleUtilisateur.ADMIN]), AdminController.getCourseStats);
// Gestion des utilisateurs
router.get('/users', auth_1.default, (0, authorize_1.default)([RoleUtilisateur_1.RoleUtilisateur.ADMIN]), AdminController.getAllUsers);
router.put('/users/:userId', auth_1.default, (0, authorize_1.default)([RoleUtilisateur_1.RoleUtilisateur.ADMIN]), AdminController.updateUser);
router.delete('/users/:userId', auth_1.default, (0, authorize_1.default)([RoleUtilisateur_1.RoleUtilisateur.ADMIN]), AdminController.deleteUser);
// Gestion des cours
router.post('/courses', auth_1.default, (0, authorize_1.default)([RoleUtilisateur_1.RoleUtilisateur.ADMIN]), AdminController.createCourse);
router.get('/courses', auth_1.default, (0, authorize_1.default)([RoleUtilisateur_1.RoleUtilisateur.ADMIN]), AdminController.getAllCourses);
router.put('/courses/:coursId', auth_1.default, (0, authorize_1.default)([RoleUtilisateur_1.RoleUtilisateur.ADMIN]), AdminController.updateCourse);
router.delete('/courses/:coursId', auth_1.default, (0, authorize_1.default)([RoleUtilisateur_1.RoleUtilisateur.ADMIN]), AdminController.deleteCourse);
exports.default = router;
//# sourceMappingURL=apprenant.js.map