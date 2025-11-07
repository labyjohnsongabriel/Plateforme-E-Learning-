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

// =======================
// ✅ INSCRIPTIONS ÉTUDIANT
// =======================
router.post(
  '/enroll',
  ...restrictToEtudiant,
  [
    body('coursId')
      .isMongoId()
      .withMessage('Identifiant de cours invalide')
      .notEmpty()
      .withMessage('L\'identifiant du cours est requis')
  ],
  InscriptionController.enroll
);

router.get('/enrollments', ...restrictToEtudiant, InscriptionController.getUserEnrollments);

router.get(
  '/enrollment/:id',
  ...restrictToEtudiant,
  [
    param('id')
      .isMongoId()
      .withMessage('Identifiant d\'inscription invalide')
  ],
  InscriptionController.getEnrollmentById
);

router.put(
  '/enrollment/:id/status',
  ...restrictToEtudiant,
  [
    param('id')
      .isMongoId()
      .withMessage('Identifiant d\'inscription invalide'),
    body('statut')
      .isIn(['ACTIVE', 'COMPLETE', 'CANCELLED'])
      .withMessage('Statut invalide')
  ],
  InscriptionController.updateStatus
);

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
// ✅ INSTRUCTEUR - ÉTUDIANTS ET STATISTIQUES
// =======================
router.get(
  '/instructor/students',
  ...restrictToInstructeur,
  InscriptionController.getInstructorStudents
);

router.get(
  '/instructor/stats',
  ...restrictToInstructeur,
  InscriptionController.getInstructorStats
);

// =======================
// ✅ COMMUN - STATISTIQUES ET VÉRIFICATIONS
// =======================
router.get('/stats', ...restrictToBoth, InscriptionController.getStats);

router.get(
  '/check-enrollment/:coursId',
  ...restrictToBoth,
  [
    param('coursId')
      .isMongoId()
      .withMessage('Identifiant de cours invalide')
  ],
  InscriptionController.checkEnrollment
);

// =======================
// ✅ PROGRESSIONS (existant)
// =======================
router.get('/progress/global', ...restrictToEtudiant, ProgressionController.getGlobalProgress);

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

router.put(
  '/progress/:coursId',
  ...restrictToEtudiant,
  [
    param('coursId')
      .isMongoId()
      .withMessage('Identifiant de cours invalide'),
    body('pourcentage')
      .isFloat({ min: 0, max: 100 })
      .withMessage('Pourcentage doit être entre 0 et 100'),
  ],
  ProgressionController.update
);
// =======================
// PROGRESSIONS - NOUVEL ENDPOINT
// =======================
router.post(
  '/progress/complete',
  ...restrictToEtudiant,
  [
    body('courseId').isMongoId().withMessage('courseId invalide'),
    body('contenuId').optional().isMongoId().withMessage('contenuId invalide'),
  ],
  ProgressionController.markContentComplete
);

// =======================
// ✅ CERTIFICATS (existant)
// =======================
router.get('/certificates', ...restrictToEtudiant, CertificatController.getByUser);

router.get(
  '/certificate/:id/download',
  ...restrictToEtudiant,
  [
    param('id')
      .isMongoId()
      .withMessage('Identifiant de certificat invalide')
  ],
  CertificatController.download
);

export default router;