"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/notifications.js
const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/notification/NotificationController");
const authMiddleware = require("../middleware/auth");
const authorizationMiddleware = require("../middleware/authorization");
const validationMiddleware = require("../middleware/validation");
const { RoleUtilisateur } = require("../../src/models/user/User");
const Joi = require("joi");
const notificationValidator = {
    create: Joi.object({
        utilisateur: Joi.string().required(),
        message: Joi.string().required(),
        type: Joi.string()
            .valid("RAPPEL_COURS", "CERTIFICAT", "PROGRESSION")
            .required(),
    }),
    createBatch: Joi.object({
        message: Joi.string().required(),
        type: Joi.string()
            .valid("RAPPEL_COURS", "CERTIFICAT", "PROGRESSION")
            .required(),
        utilisateurIds: Joi.array().items(Joi.string()).required(),
    }),
};
router.post("/", authMiddleware, authorizationMiddleware([RoleUtilisateur.ADMIN]), validationMiddleware(notificationValidator.create), NotificationController.create);
router.post("/batch", authMiddleware, authorizationMiddleware([RoleUtilisateur.ADMIN]), validationMiddleware(notificationValidator.createBatch), NotificationController.createBatch);
router.get("/", authMiddleware, authorizationMiddleware([RoleUtilisateur.LEARNER, RoleUtilisateur.ADMIN]), NotificationController.getForUser);
router.put("/:id/read", authMiddleware, authorizationMiddleware([RoleUtilisateur.LEARNER, RoleUtilisateur.ADMIN]), NotificationController.markAsRead);
router.delete("/:id", authMiddleware, authorizationMiddleware([RoleUtilisateur.LEARNER, RoleUtilisateur.ADMIN]), NotificationController.delete);
router.post("/:id/envoyer", authMiddleware, authorizationMiddleware([RoleUtilisateur.ADMIN]), NotificationController.envoyer);
module.exports = router;
//# sourceMappingURL=notifications.js.map