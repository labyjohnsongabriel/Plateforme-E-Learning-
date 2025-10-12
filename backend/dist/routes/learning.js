"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../middleware/auth"));
const authorization_1 = __importDefault(require("../middleware/authorization"));
const User_1 = require("../models/user/User");
const InscriptionController_1 = __importDefault(require("../controllers/learning/InscriptionController"));
const ProgressionController_1 = __importDefault(require("../controllers/learning/ProgressionController"));
const CertificatController_1 = __importDefault(require("../controllers/learning/CertificatController"));
const router = (0, express_1.Router)();
// --- Routes pour inscriptions ---
router.post('/enroll', auth_1.default, (0, authorization_1.default)([User_1.RoleUtilisateur.ETUDIANT]), 
// validate(learningValidator.enroll), // tableau de ValidationChain
InscriptionController_1.default.enroll);
router.get('/enrollments', auth_1.default, (0, authorization_1.default)([User_1.RoleUtilisateur.ETUDIANT]), InscriptionController_1.default.getUserEnrollments);
router.put('/enrollment/:id/status', auth_1.default, (0, authorization_1.default)([User_1.RoleUtilisateur.ETUDIANT]), InscriptionController_1.default.updateStatus);
router.delete('/enrollment/:id', auth_1.default, (0, authorization_1.default)([User_1.RoleUtilisateur.ETUDIANT]), InscriptionController_1.default.delete // ok, le controller gère l'appel
);
// --- Routes pour progressions ---
router.get('/progress/:coursId', auth_1.default, (0, authorization_1.default)([User_1.RoleUtilisateur.ETUDIANT]), ProgressionController_1.default.getByUserAndCourse);
router.put('/progress/:coursId', auth_1.default, (0, authorization_1.default)([User_1.RoleUtilisateur.ETUDIANT]), 
//validate(learningValidator.updateProgress),
ProgressionController_1.default.update);
// --- Routes pour certificats ---
router.get('/certificates', auth_1.default, (0, authorization_1.default)([User_1.RoleUtilisateur.ETUDIANT]), CertificatController_1.default.getByUser);
router.get('/certificate/:id/download', auth_1.default, (0, authorization_1.default)([User_1.RoleUtilisateur.ETUDIANT]), CertificatController_1.default.download);
exports.default = router;
//# sourceMappingURL=learning.js.map