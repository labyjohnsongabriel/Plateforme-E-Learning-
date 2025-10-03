"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const InstructeurController = require("../controllers/user/InstructeurController");
const authMiddleware = require("../middleware/auth");
const authorizationMiddleware = require("../middleware/authorization");
const Role = require("../models/enums/RoleUtilisateur");
router.get("/:id/courses", authMiddleware, authorizationMiddleware([Role.INSTRUCTEUR]), InstructeurController.getCourses);
router.post("/:id/courses", authMiddleware, authorizationMiddleware([Role.INSTRUCTEUR]), InstructeurController.createCourse);
router.put("/:id/courses", authMiddleware, authorizationMiddleware([Role.INSTRUCTEUR]), InstructeurController.updateCourse);
router.post("/:id/courses/submit", authMiddleware, authorizationMiddleware([Role.INSTRUCTEUR]), InstructeurController.submitForApproval);
router.get("/:id/courses-in-progress", authMiddleware, authorizationMiddleware([Role.INSTRUCTEUR]), InstructeurController.getCoursesInProgress);
router.get("/:id/profile", authMiddleware, authorizationMiddleware([Role.INSTRUCTEUR]), InstructeurController.getProfile);
module.exports = router;
//# sourceMappingURL=instructeur.js.map