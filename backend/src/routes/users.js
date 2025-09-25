const express = require("express");
const router = express.Router();
const {
  UserController,
  ApprenantController,
  AdministrateurController,
} = require("../controllers/user/UserController");
const authMiddleware = require("../middleware/auth");
const authorizationMiddleware = require("../middleware/authorization");
const validationMiddleware = require("../middleware/validation");
const userValidator = require("../validators/userValidator");
const { RoleUtilisateur } = require("../models/user/User");

router.get(
  "/",
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.ADMIN]),
  UserController.getAll
);

router.get(
  "/:id",
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.ADMIN]),
  UserController.getById
);

router.put(
  "/:id",
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.ADMIN]),
  validationMiddleware(userValidator.update),
  UserController.update
);

router.delete(
  "/:id",
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.ADMIN]),
  UserController.delete
);

// Routes spécifiques à Apprenant
router.get(
  "/:id/progress",
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.LEARNER, RoleUtilisateur.ADMIN]),
  ApprenantController.getProgress
);

router.get(
  "/:id/certificats",
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.LEARNER, RoleUtilisateur.ADMIN]),
  ApprenantController.getCertificats
);

// Routes spécifiques à Administrateur
router.get(
  "/admin/users",
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.ADMIN]),
  AdministrateurController.gererUtilisateurs
);

router.get(
  "/admin/stats",
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.ADMIN]),
  AdministrateurController.genererStatistiques
);

module.exports = router;
