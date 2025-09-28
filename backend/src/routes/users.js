// backend/routes/courses.js
const express = require("express");
const router = express.Router();
const CoursController = require("../controllers/course/CoursController");
const ContenuController = require("../controllers/course/ContenuController");
const QuizController = require("../controllers/course/QuizController");
const DomaineController = require("../controllers/course/DomaineController");
const authMiddleware = require("../middleware/auth");
const authorizationMiddleware = require("../middleware/authorization");
const validationMiddleware = require("../middleware/validation");
const courseValidator = require("../validators/courseValidator");
const uploadMiddleware = require("../middleware/upload");
const { RoleUtilisateur } = require("../models/user/User");
const createError = require("http-errors");

// Routes pour Domaine (moved before dynamic :id routes to avoid conflicts)
router.post(
  "/domaine",
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.ADMIN]),
  validationMiddleware(courseValidator.createDomaine),
  DomaineController.create
);
router.get("/domaine", DomaineController.getAll); // Public access for domain catalog
router.get("/domaine/:id", DomaineController.getById);
router.put(
  "/domaine/:id",
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.ADMIN]),
  validationMiddleware(courseValidator.updateDomaine),
  DomaineController.update
);
router.delete(
  "/domaine/:id",
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.ADMIN]),
  DomaineController.delete
);

// Route for domain statistics
router.get(
  "/domaine/:id/stats",
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.ADMIN]),
  async (req, res, next) => {
    try {
      const Domaine = require("../models/course/Domaine");
      const domaine = await Domaine.findById(req.params.id);
      if (!domaine) throw createError(404, "Domaine non trouvé");
      const stats = await domaine.getStatistiques();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }
);

// Routes pour Cours
router.post(
  "/",
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.ADMIN]),
  validationMiddleware(courseValidator.create),
  CoursController.create
);
router.get("/", CoursController.getAll); // Public access for course catalog
router.get("/:id", CoursController.getById); // Public access for course details
router.put(
  "/:id",
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.ADMIN]),
  validationMiddleware(courseValidator.update),
  CoursController.update
);
router.delete(
  "/:id",
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.ADMIN]),
  CoursController.delete
);

// Routes pour Contenu
router.post(
  "/contenu",
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.ADMIN]),
  uploadMiddleware,
  validationMiddleware(courseValidator.createContenu),
  ContenuController.create
);
router.get("/contenu/:id", authMiddleware, ContenuController.getById);
router.put(
  "/contenu/:id",
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.ADMIN]),
  uploadMiddleware,
  validationMiddleware(courseValidator.updateContenu),
  ContenuController.update
);
router.delete(
  "/contenu/:id",
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.ADMIN]),
  ContenuController.delete
);

// Routes pour Quiz
router.post(
  "/quiz",
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.ADMIN]),
  validationMiddleware(courseValidator.createQuiz),
  QuizController.create
);
router.get("/quiz/:id", authMiddleware, QuizController.getById);
router.put(
  "/quiz/:id",
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.ADMIN]),
  validationMiddleware(courseValidator.updateQuiz),
  QuizController.update
);
router.delete(
  "/quiz/:id",
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.ADMIN]),
  QuizController.delete
);

// Route for learners to submit quiz answers
router.post(
  "/quiz/:id/soumettre",
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.LEARNER]),
  QuizController.soumettre
);

module.exports = router;
