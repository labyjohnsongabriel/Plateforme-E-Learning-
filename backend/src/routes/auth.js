const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth/AuthController");
const ProfileController = require("../controllers/auth/ProfileController");
const authMiddleware = require("../middleware/auth");
const authValidator = require("../validators/authValidator");

/**
 * @route POST /api/auth/register
 * @desc Inscription d'un nouvel utilisateur
 * @access Public
 */
router.post("/register", authValidator.register, AuthController.register);

/**
 * @route POST /api/auth/login
 * @desc Connexion d'un utilisateur
 * @access Public
 */
router.post("/login", authValidator.login, AuthController.login);

/**
 * @route GET /api/auth/me
 * @desc Récupérer les informations de l'utilisateur authentifié
 * @access Privé
 */
router.get("/me", authMiddleware, AuthController.getMe);

/**
 * @route GET /api/auth/profile
 * @desc Récupérer le profil utilisateur
 * @access Privé
 */
router.get("/profile", authMiddleware, ProfileController.getProfile);

/**
 * @route PUT /api/auth/profile
 * @desc Mettre à jour le profil utilisateur
 * @access Privé
 */
router.put("/profile", authMiddleware, ProfileController.updateProfile);

module.exports = router;
