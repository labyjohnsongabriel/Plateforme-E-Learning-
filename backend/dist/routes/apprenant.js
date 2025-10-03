"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const ApprenantController = require("../controllers/user/ApprenantController");
const authMiddleware = require("../middleware/auth");
const authorizationMiddleware = require("../middleware/authorization");
const Role = require("../models/enums/RoleUtilisateur");
router.get("/:id/progress", authMiddleware, authorizationMiddleware([Role.APPRENANT]), ApprenantController.getProgress);
router.get("/:id/certificates", authMiddleware, authorizationMiddleware([Role.APPRENANT]), ApprenantController.getCertificates);
router.post("/:id/enroll", authMiddleware, authorizationMiddleware([Role.APPRENANT]), ApprenantController.enrollInCourse);
router.put("/:id/progress", authMiddleware, authorizationMiddleware([Role.APPRENANT]), ApprenantController.updateProgress);
router.get("/:id/profile", authMiddleware, authorizationMiddleware([Role.APPRENANT]), ApprenantController.getProfile);
module.exports = router;
//# sourceMappingURL=apprenant.js.map