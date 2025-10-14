import { Router } from 'express';
import NotificationController from '../controllers/notification/NotificationController'; // Changed to named import
import authMiddleware from '../middleware/auth';
import authorizationMiddleware from '../middleware/authorization';
import { joiValidation } from '../middleware/joiValidation';
import { RoleUtilisateur } from '../models/user/User';
import Joi from 'joi';

const router = Router();

// Schémas de validation Joi
const notificationValidator = {
  create: Joi.object({
    utilisateur: Joi.string().required().messages({
      'string.empty': "L'utilisateur est requis",
      'any.required': "L'utilisateur est obligatoire",
    }),
    message: Joi.string().required().min(1).max(500).messages({
      'string.empty': 'Le message est requis',
      'string.min': 'Le message doit contenir au moins 1 caractère',
      'string.max': 'Le message ne peut pas dépasser 500 caractères',
      'any.required': 'Le message est obligatoire',
    }),
    type: Joi.string()
      .valid('RAPPEL_COURS', 'CERTIFICAT', 'PROGRESSION')
      .required()
      .messages({
        'any.only': 'Le type doit être RAPPEL_COURS, CERTIFICAT ou PROGRESSION',
        'any.required': 'Le type est obligatoire',
      }),
    lu: Joi.boolean().optional(),
    dateEnvoi: Joi.date().optional(),
  }),

  createBatch: Joi.object({
    message: Joi.string().required().min(1).max(500).messages({
      'string.empty': 'Le message est requis',
      'string.min': 'Le message doit contenir au moins 1 caractère',
      'string.max': 'Le message ne peut pas dépasser 500 caractères',
      'any.required': 'Le message est obligatoire',
    }),
    type: Joi.string()
      .valid('RAPPEL_COURS', 'CERTIFICAT', 'PROGRESSION')
      .required()
      .messages({
        'any.only': 'Le type doit être RAPPEL_COURS, CERTIFICAT ou PROGRESSION',
        'any.required': 'Le type est obligatoire',
      }),
    utilisateurIds: Joi.array().items(Joi.string()).min(1).required().messages({
      'array.min': 'Au moins un utilisateur doit être spécifié',
      'any.required': 'La liste des utilisateurs est obligatoire',
    }),
  }),

  markAsRead: Joi.object({
    id: Joi.string().required().messages({
      'string.empty': "L'ID de la notification est requis",
      'any.required': "L'ID de la notification est obligatoire",
    }),
  }),
};

// Routes
router.post(
  '/',
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.ADMIN]),
  joiValidation(notificationValidator.create),
  NotificationController.create
);

router.post(
  '/batch',
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.ADMIN]),
  joiValidation(notificationValidator.createBatch),
  NotificationController.createBatch
);

router.get(
  '/',
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.ETUDIANT, RoleUtilisateur.ADMIN]),
  NotificationController.getForUser
);

router.put(
  '/:id/read',
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.ETUDIANT, RoleUtilisateur.ADMIN]),
  NotificationController.markAsRead
);

router.delete(
  '/:id',
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.ETUDIANT, RoleUtilisateur.ADMIN]),
  NotificationController.deleteNotification
);

router.post(
  '/:id/envoyer',
  authMiddleware,
  authorizationMiddleware([RoleUtilisateur.ADMIN]),
  NotificationController.envoyer
);

export default router;