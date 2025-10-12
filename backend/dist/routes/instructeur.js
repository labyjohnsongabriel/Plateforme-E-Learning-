"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const InstructeurController_1 = require("../controllers/user/InstructeurController");
const auth_1 = __importDefault(require("../middleware/auth"));
const authorization_1 = __importDefault(require("../middleware/authorization"));
const types_1 = require("../types");
const router = (0, express_1.Router)();
router.get('/:id/courses', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ENSEIGNANT, types_1.RoleUtilisateur.ADMIN]), InstructeurController_1.getCourses);
router.post('/:id/courses', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ENSEIGNANT, types_1.RoleUtilisateur.ADMIN]), InstructeurController_1.createCourse);
router.put('/:id/courses/:courseId', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ENSEIGNANT, types_1.RoleUtilisateur.ADMIN]), InstructeurController_1.updateCourse);
router.post('/:id/courses/:courseId/submit', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ENSEIGNANT, types_1.RoleUtilisateur.ADMIN]), InstructeurController_1.submitForApproval);
router.get('/:id/courses-in-progress', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ENSEIGNANT, types_1.RoleUtilisateur.ADMIN]), InstructeurController_1.getCoursesInProgress);
router.get('/:id/profile', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ENSEIGNANT, types_1.RoleUtilisateur.ADMIN]), InstructeurController_1.getProfile);
exports.default = router;
//# sourceMappingURL=instructeur.js.map