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
const CoursController = __importStar(require("../controllers/course/CoursController"));
const ContenuController = __importStar(require("../controllers/course/ContenuController"));
const QuizController = __importStar(require("../controllers/course/QuizController"));
const DomaineController = __importStar(require("../controllers/course/DomaineController"));
const Domaine_1 = __importDefault(require("../models/course/Domaine"));
const auth_1 = __importDefault(require("../middleware/auth"));
const authorize_1 = __importDefault(require("../middleware/authorize"));
const validate_1 = __importDefault(require("../middleware/validate"));
const courseValidator = __importStar(require("../validators/courseValidator"));
const User_1 = require("../models/user/User");
const http_errors_1 = __importDefault(require("http-errors"));
const router = (0, express_1.Router)();
// Routes pour Domaine
router.post('/domaine', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ADMIN]), (0, validate_1.default)(courseValidator.createDomaine), DomaineController.create);
router.get('/domaine', DomaineController.getAll);
router.get('/domaine/:id', DomaineController.getById);
router.put('/domaine/:id', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ADMIN]), (0, validate_1.default)(courseValidator.updateDomaine), DomaineController.update);
router.delete('/domaine/:id', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ADMIN]), DomaineController.delete);
// Route for domain statistics
router.get('/domaine/:id/stats', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ADMIN]), async (req, res, next) => {
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
router.post('/', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ADMIN]), (0, validate_1.default)(courseValidator.create), CoursController.create);
router.get('/', CoursController.getAll);
router.get('/:id', CoursController.getById);
router.put('/:id', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ADMIN]), (0, validate_1.default)(courseValidator.update), CoursController.update);
router.delete('/:id', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ADMIN]), CoursController.delete);
// Routes pour Contenu (commented out as in original)
/*
router.post(
  '/contenu',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  upload.single('file'),
  validate(courseValidator.createContenu),
  ContenuController.create as (req: Request, res: Response, next: NextFunction) => Promise<void>
);
*/
router.get('/contenu/:id', auth_1.default, ContenuController.getById);
/*
router.put(
  '/contenu/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  upload.single('file'),
  validate(courseValidator.updateContenu),
  ContenuController.update as (req: Request, res: Response, next: NextFunction) => Promise<void>
);
*/
router.delete('/contenu/:id', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ADMIN]), ContenuController.delete);
// Routes pour Quiz
router.post('/quiz', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ADMIN]), (0, validate_1.default)(courseValidator.createQuiz), QuizController.create);
router.get('/quiz/:id', auth_1.default, QuizController.getById);
router.put('/quiz/:id', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ADMIN]), (0, validate_1.default)(courseValidator.updateQuiz), QuizController.update);
router.delete('/quiz/:id', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ADMIN]), QuizController.delete);
// Route for learners to submit quiz answers
router.post('/quiz/:id/soumettre', auth_1.default, (0, authorize_1.default)([User_1.RoleUtilisateur.ETUDIANT]), QuizController.soumettre);
exports.default = router;
//# sourceMappingURL=courses.js.map