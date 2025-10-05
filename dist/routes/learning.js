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
const InscriptionController = __importStar(require("../controllers/learning/InscriptionController"));
const ProgressionController = __importStar(require("../controllers/learning/ProgressionController"));
const CertificatController = __importStar(require("../controllers/learning/CertificatController"));
const auth_1 = __importDefault(require("../middleware/auth"));
const authorize_1 = __importDefault(require("../middleware/authorize"));
const validate_1 = __importDefault(require("../middleware/validate"));
const learningValidator = __importStar(require("../validators/learningValidator"));
const User_1 = require("../models/user/User");
const router = (0, express_1.Router)();
// Routes pour inscriptions
router.post('/enroll', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ETUDIANT]), (0, validate_1.default)(learningValidator.enroll), InscriptionController.enroll);
router.get('/enrollments', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ETUDIANT]), InscriptionController.getUserEnrollments);
router.put('/enrollment/:id/status', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ETUDIANT]), InscriptionController.updateStatus);
router.delete('/enrollment/:id', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ETUDIANT]), InscriptionController.delete);
// Routes pour progressions
router.get('/progress/:coursId', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ETUDIANT]), ProgressionController.getByUserAndCourse);
router.put('/progress/:coursId', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ETUDIANT]), (0, validate_1.default)(learningValidator.updateProgress), ProgressionController.update);
// Routes pour certificats
router.get('/certificates', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ETUDIANT]), CertificatController.getByUser);
router.get('/certificate/:id/download', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ETUDIANT]), CertificatController.download);
exports.default = router;
//# sourceMappingURL=learning.js.map