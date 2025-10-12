"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdministrateurController_1 = __importDefault(require("../controllers/user/AdministrateurController"));
const auth_1 = __importDefault(require("../middleware/auth"));
const authorization_1 = __importDefault(require("../middleware/authorization"));
const types_1 = require("../types"); // Updated to match AdministrateurController
const router = (0, express_1.Router)();
// Stats routes
router.get('/stats/global', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ADMIN]), AdministrateurController_1.default.getGlobalStats);
router.get('/stats/user/:userId', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ADMIN]), AdministrateurController_1.default.getUserStats);
router.get('/stats/course/:coursId', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ADMIN]), AdministrateurController_1.default.getCourseStats);
// User management routes
router.get('/users', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ADMIN]), AdministrateurController_1.default.getAllUsers);
router.put('/users/:userId', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ADMIN]), AdministrateurController_1.default.updateUser);
router.delete('/users/:userId', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ADMIN]), AdministrateurController_1.default.deleteUser);
// Course management routes
router.post('/courses', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ADMIN]), AdministrateurController_1.default.createCourse);
router.get('/courses', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ADMIN]), AdministrateurController_1.default.getAllCourses);
router.put('/courses/:coursId', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ADMIN]), AdministrateurController_1.default.updateCourse);
router.delete('/courses/:coursId', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ADMIN]), AdministrateurController_1.default.deleteCourse);
//# sourceMappingURL=apprenant.js.map