"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdministrateurController_1 = __importDefault(require("../controllers/user/AdministrateurController")); // Changé de `import * as` à `import`
const auth_1 = __importDefault(require("../middleware/auth"));
const authorize_1 = __importDefault(require("../middleware/authorize"));
const User_1 = require("../models/user/User");
const router = (0, express_1.Router)();
// Stats
router.get('/stats/global', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ADMIN]), AdministrateurController_1.default.getGlobalStats);
router.get('/stats/user/:userId', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ADMIN]), AdministrateurController_1.default.getUserStats);
router.get('/stats/course/:coursId', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ADMIN]), AdministrateurController_1.default.getCourseStats);
// Gestion users
router.get('/users', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ADMIN]), AdministrateurController_1.default.getAllUsers);
router.put('/users/:userId', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ADMIN]), AdministrateurController_1.default.updateUser);
router.delete('/users/:userId', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ADMIN]), AdministrateurController_1.default.deleteUser);
// Gestion cours
router.post('/courses', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ADMIN]), AdministrateurController_1.default.createCourse);
router.get('/courses', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ADMIN]), AdministrateurController_1.default.getAllCourses);
router.put('/courses/:coursId', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ADMIN]), AdministrateurController_1.default.updateCourse);
router.delete('/courses/:coursId', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ADMIN]), AdministrateurController_1.default.deleteCourse);
exports.default = router;
//# sourceMappingURL=admin.js.map