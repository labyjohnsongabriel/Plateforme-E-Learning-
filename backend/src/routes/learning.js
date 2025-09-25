const express = require("express");
const router = express.Router();
const InscriptionController = require("../controllers/learning/InscriptionController");
const ProgressionController = require("../controllers/learning/ProgressionController");
const CertificatController = require("../controllers/learning/CertificatController");
const authMiddleware = require("../middleware/auth");
const authorizationMiddleware = require("../middleware/authorization");
const validationMiddleware = require("../middleware/validation");
const learningValidator = require("../validators/learningValidator");
const Role = require("../models/enums/RoleUtilisateur"); 

// Routes pour inscriptions (inchangées, mais commentées pour clarté)
router.post(
  "/enroll",
  authMiddleware,
  authorizationMiddleware([Role.APPRENANT]),
  validationMiddleware(learningValidator.enroll),
  InscriptionController.enroll
);
router.get(
  "/enrollments",
  authMiddleware,
  authorizationMiddleware([Role.APPRENANT]),
  InscriptionController.getUserEnrollments
);
router.put(
  "/enrollment/:id/status",
  authMiddleware,
  authorizationMiddleware([Role.APPRENANT]),
  InscriptionController.updateStatus
);
router.delete(
  "/enrollment/:id",
  authMiddleware,
  authorizationMiddleware([Role.APPRENANT]),
  InscriptionController.delete
);

// Routes pour progressions (inchangées)
router.get(
  "/progress/:coursId",
  authMiddleware,
  authorizationMiddleware([Role.APPRENANT]),
  ProgressionController.getByUserAndCourse
);
router.put(
  "/progress/:coursId",
  authMiddleware,
  authorizationMiddleware([Role.APPRENANT]),
  validationMiddleware(learningValidator.updateProgress),
  ProgressionController.update
);

// Routes pour certificats (corrigées et complétées)
// Récupération des certificats de l'utilisateur
router.get(
  "/certificates",
  authMiddleware,
  authorizationMiddleware([Role.APPRENANT]),
  CertificatController.getByUser
);
// Téléchargement d'un certificat spécifique (vérifie l'autorisation)
router.get(
  "/certificate/:id/download",
  authMiddleware,
  authorizationMiddleware([Role.APPRENANT]),
  CertificatController.download
);

module.exports = router;