"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/notifications.ts
const express_1 = require("express");
const NotificationController_1 = __importDefault(require("../controllers/notification/NotificationController"));
const auth_1 = __importDefault(require("../middleware/auth"));
const authorization_1 = __importDefault(require("../middleware/authorization"));
const joiValidation_1 = require("../middleware/joiValidation"); // Nouveau middleware Joi
const User_1 = require("../models/user/User");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
// Schémas de validation Joi
const notificationValidator = {
    create: joi_1.default.object({
        utilisateur: joi_1.default.string().required().messages({
            'string.empty': 'L\'utilisateur est requis',
            'any.required': 'L\'utilisateur est obligatoire'
        }),
        message: joi_1.default.string().required().min(1).max(500).messages({
            'string.empty': 'Le message est requis',
            'string.min': 'Le message doit contenir au moins 1 caractère',
            'string.max': 'Le message ne peut pas dépasser 500 caractères',
            'any.required': 'Le message est obligatoire'
        }),
        type: joi_1.default.string()
            .valid('RAPPEL_COURS', 'CERTIFICAT', 'PROGRESSION')
            .required()
            .messages({
            'any.only': 'Le type doit être RAPPEL_COURS, CERTIFICAT ou PROGRESSION',
            'any.required': 'Le type est obligatoire'
        }),
        lu: joi_1.default.boolean().optional(),
        dateEnvoi: joi_1.default.date().optional()
    }),
    createBatch: joi_1.default.object({
        message: joi_1.default.string().required().min(1).max(500).messages({
            'string.empty': 'Le message est requis',
            'string.min': 'Le message doit contenir au moins 1 caractère',
            'string.max': 'Le message ne peut pas dépasser 500 caractères',
            'any.required': 'Le message est obligatoire'
        }),
        type: joi_1.default.string()
            .valid('RAPPEL_COURS', 'CERTIFICAT', 'PROGRESSION')
            .required()
            .messages({
            'any.only': 'Le type doit être RAPPEL_COURS, CERTIFICAT ou PROGRESSION',
            'any.required': 'Le type est obligatoire'
        }),
        utilisateurIds: joi_1.default.array().items(joi_1.default.string()).min(1).required().messages({
            'array.min': 'Au moins un utilisateur doit être spécifié',
            'any.required': 'La liste des utilisateurs est obligatoire'
        })
    }),
    markAsRead: joi_1.default.object({
        id: joi_1.default.string().required().messages({
            'string.empty': 'L\'ID de la notification est requis',
            'any.required': 'L\'ID de la notification est obligatoire'
        })
    })
};
// Routes
router.post('/', auth_1.default, (0, authorization_1.default)([User_1.RoleUtilisateur.ADMIN]), (0, joiValidation_1.joiValidation)(notificationValidator.create), // Utilisation du middleware Joi
NotificationController_1.default.create);
router.post('/batch', auth_1.default, (0, authorization_1.default)([User_1.RoleUtilisateur.ADMIN]), (0, joiValidation_1.joiValidation)(notificationValidator.createBatch), // Utilisation du middleware Joi
NotificationController_1.default.createBatch);
router.get('/', auth_1.default, (0, authorization_1.default)([User_1.RoleUtilisateur.ETUDIANT, User_1.RoleUtilisateur.ADMIN]), NotificationController_1.default.getForUser);
router.put('/:id/read', auth_1.default, (0, authorization_1.default)([User_1.RoleUtilisateur.ETUDIANT, User_1.RoleUtilisateur.ADMIN]), NotificationController_1.default.markAsRead);
router.delete('/:id', auth_1.default, (0, authorization_1.default)([User_1.RoleUtilisateur.ETUDIANT, User_1.RoleUtilisateur.ADMIN]), NotificationController_1.default.deleteNotification);
router.post('/:id/envoyer', auth_1.default, (0, authorization_1.default)([User_1.RoleUtilisateur.ADMIN]), NotificationController_1.default.envoyer);
exports.default = router;
//# sourceMappingURL=notifications.js.map