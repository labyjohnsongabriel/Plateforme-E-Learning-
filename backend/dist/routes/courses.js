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
const CoursController_1 = __importDefault(require("../controllers/course/CoursController"));
const ContenuController_1 = __importDefault(require("../controllers/course/ContenuController"));
const QuizController_1 = __importDefault(require("../controllers/course/QuizController"));
const DomaineController_1 = __importDefault(require("../controllers/course/DomaineController"));
const Domaine_1 = __importDefault(require("../models/course/Domaine"));
const auth_1 = __importDefault(require("../middleware/auth"));
const authorization_1 = __importDefault(require("../middleware/authorization"));
const validation_1 = __importDefault(require("../middleware/validation"));
const courseValidator = __importStar(require("../validators/courseValidator"));
const types_1 = require("../types");
const http_errors_1 = __importDefault(require("http-errors"));
const router = (0, express_1.Router)();
// Routes pour Domaine
router.post('/domaine', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ADMIN]), (0, validation_1.default)(courseValidator.createDomaine), DomaineController_1.default.create);
router.get('/domaine', DomaineController_1.default.getAll);
router.get('/domaine/:id', DomaineController_1.default.getById);
router.put('/domaine/:id', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ADMIN]), (0, validation_1.default)(courseValidator.updateDomaine), DomaineController_1.default.update);
router.delete('/domaine/:id', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ADMIN]), DomaineController_1.default.delete);
// Route for domain statistics
router.get('/domaine/:id/stats', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ADMIN]), async (req, res, next) => {
    try {
        const domaine = await Domaine_1.default.findById(req.params.id);
        if (!domaine)
            throw (0, http_errors_1.default)(404, 'Domaine non trouvé');
        const stats = await domaine.getStatistiques();
        res.json(stats);
    }
    catch (err) {
        next(err);
    }
});
// Routes pour Cours
router.post('/', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ADMIN]), (0, validation_1.default)(courseValidator.create), CoursController_1.default.create);
router.get('/', CoursController_1.default.getAll);
router.get('/:id', CoursController_1.default.getById);
router.put('/:id', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ADMIN]), (0, validation_1.default)(courseValidator.update), CoursController_1.default.update);
router.delete('/:id', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ADMIN]), CoursController_1.default.delete);
// Routes pour Contenu
router.get('/contenu/:id', auth_1.default, ContenuController_1.default.getById);
router.delete('/contenu/:id', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ADMIN]), ContenuController_1.default.delete);
// Routes pour Quiz
router.post('/quiz', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ADMIN]), (0, validation_1.default)(courseValidator.createQuiz), QuizController_1.default.create);
router.get('/quiz/:id', auth_1.default, QuizController_1.default.getById);
router.put('/quiz/:id', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ADMIN]), (0, validation_1.default)(courseValidator.updateQuiz), QuizController_1.default.update);
router.delete('/quiz/:id', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ADMIN]), QuizController_1.default.delete);
// Route for learners to submit quiz answers
router.post('/quiz/:id/soumettre', auth_1.default, (0, authorization_1.default)([types_1.RoleUtilisateur.ETUDIANT]), QuizController_1.default.soumettre);
exports.default = router;
//# sourceMappingURL=courses.js.map