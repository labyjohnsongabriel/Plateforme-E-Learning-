// src/routes/learning.ts
import { Router } from 'express';
import { body, param } from 'express-validator';
import authMiddleware from '../middleware/auth';
import authorize from '../middleware/authorization';
import { RoleUtilisateur } from '../models/user/User';
import InscriptionController from '../controllers/learning/InscriptionController';
import ProgressionController from '../controllers/learning/ProgressionController';
import CertificatController from '../controllers/learning/CertificatController';

const router = Router();

const restrictToEtudiant = [authMiddleware, authorize([RoleUtilisateur.ETUDIANT])];
const restrictToInstructeur = [authMiddleware, authorize([RoleUtilisateur.ENSEIGNANT])];
const restrictToBoth = [authMiddleware, authorize([RoleUtilisateur.ETUDIANT, RoleUtilisateur.ENSEIGNANT])];


// Progression globale
router.get('/progress/global', ...restrictToEtudiant, ProgressionController.getGlobalProgress);

// Progression pour un cours spécifique (avec les deux paramètres possibles)
router.get(
  '/progress/:coursId',
  ...restrictToEtudiant,
  [
    param('coursId')
      .isMongoId()
      .withMessage('Identifiant de cours invalide')
  ],
  ProgressionController.getByUserAndCourse
);

// Alternative avec courseId
router.get(
  '/progress/course/:courseId',
  ...restrictToEtudiant,
  [
    param('courseId')
      .isMongoId()
      .withMessage('Identifiant de cours invalide')
  ],
  ProgressionController.getByUserAndCourse
);

// Mise à jour de progression
router.put(
  '/progress/:coursId',
  ...restrictToEtudiant,
  [
    param('coursId')
      .isMongoId()
      .withMessage('Identifiant de cours invalide'),
    body('pourcentage')
      .isFloat({ min: 0, max: 100 })
      .withMessage('Pourcentage doit être entre 0 et 100')
  ],
  ProgressionController.update
);

// Marquage de contenu comme complété
router.post(
  '/progress/complete',
  ...restrictToEtudiant,
  [
    body('courseId')
      .isMongoId()
      .withMessage('courseId invalide'),
    body('moduleId')
      .optional()
      .isMongoId()
      .withMessage('moduleId invalide'),
    body('contenuId')
      .optional()
      .isMongoId()
      .withMessage('contenuId invalide')
  ],
  ProgressionController.markContentComplete
);

// =======================
// ✅ INSCRIPTIONS
// =======================
router.post(
  '/enroll',
  ...restrictToEtudiant,
  [
    body('coursId')
      .isMongoId()
      .withMessage('Identifiant de cours invalide')
  ],
  InscriptionController.enroll
);

router.get('/enrollments', ...restrictToEtudiant, InscriptionController.getUserEnrollments);

router.delete(
  '/enrollment/:id',
  ...restrictToEtudiant,
  [
    param('id')
      .isMongoId()
      .withMessage('Identifiant d\'inscription invalide')
  ],
  InscriptionController.delete
);

// =======================
// ✅ CERTIFICATS
// =======================
router.get('/certificates', ...restrictToEtudiant, CertificatController.getByUser);

export default router;