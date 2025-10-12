"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = __importDefault(require("../controllers/auth/AuthController")); // Default import
const ProfileController_1 = __importDefault(require("../controllers/auth/ProfileController")); // Default import
const auth_1 = __importDefault(require("../middleware/auth"));
const authValidator_1 = require("../validators/authValidator"); // Changed to named imports
const router = (0, express_1.Router)();
/**
 * @route POST /api/auth/register
 * @desc Inscription d'un nouvel utilisateur
 * @access Public
 */
router.post('/register', authValidator_1.register, // Use named import directly
AuthController_1.default.register);
/**
 * @route POST /api/auth/login
 * @desc Connexion d'un utilisateur
 * @access Public
 */
router.post('/login', authValidator_1.login, // Use named import directly
AuthController_1.default.login);
/**
 * @route GET /api/auth/me
 * @desc Récupérer les informations de l'utilisateur authentifié
 * @access Privé
 */
router.get('/me', auth_1.default, AuthController_1.default.getMe);
/**
 * @route GET /api/auth/profile
 * @desc Récupérer le profil utilisateur
 * @access Privé
 */
router.get('/profile', auth_1.default, ProfileController_1.default.getProfile);
/**
 * @route PUT /api/auth/profile
 * @desc Mettre à jour le profil utilisateur
 * @access Privé
 */
router.put('/profile', auth_1.default, ProfileController_1.default.updateProfile);
exports.default = router;
//# sourceMappingURL=auth.js.map