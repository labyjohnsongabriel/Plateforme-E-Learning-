// Router file
import { Router } from 'express';
import { body, param } from 'express-validator'; // ✅ param ajouté ici
import authMiddleware from '../middleware/auth';
import authorize from '../middleware/authorization';
import { RoleUtilisateur } from '../models/user/User';
import InscriptionController from '../controllers/learning/InscriptionController';
import ProgressionController from '../controllers/learning/ProgressionController';
import CertificatController from '../controllers/learning/CertificatController';

const router = Router();

const restrictToEtudiant = [authMiddleware, authorize([RoleUtilisateur.ETUDIANT])];

// Inscriptions
router.post(
  '/enroll',
  ...restrictToEtudiant,
  [body('coursId').isMongoId().withMessage('Identifiant de cours invalide')],
  InscriptionController.enroll
);

router.get('/enrollments', ...restrictToEtudiant, InscriptionController.getUserEnrollments);
router.put(
  '/enrollment/:id/status',
  ...restrictToEtudiant,
  [param('id').isMongoId().withMessage('Identifiant d’inscription invalide')],
  InscriptionController.updateStatus
);
router.delete(
  '/enrollment/:id',
  ...restrictToEtudiant,
  [param('id').isMongoId().withMessage('Identifiant d’inscription invalide')],
  InscriptionController.delete
);

// Progressions
router.get('/progress/global', ...restrictToEtudiant, ProgressionController.getGlobalProgress);
router.get(
  '/progress/:coursId',
  ...restrictToEtudiant,
  [param('coursId').isMongoId().withMessage('Identifiant de cours invalide')],
  ProgressionController.getByUserAndCourse
);
router.put(
  '/progress/:coursId',
  ...restrictToEtudiant,
  [
    param('coursId').isMongoId().withMessage('Identifiant de cours invalide'),
    body('pourcentage').isFloat({ min: 0, max: 100 }).withMessage('Pourcentage doit être entre 0 et 100'),
  ],
  ProgressionController.update
);

// Certificats
router.get('/certificates', ...restrictToEtudiant, CertificatController.getByUser);
router.get(
  '/certificate/:id/download',
  ...restrictToEtudiant,
  [param('id').isMongoId().withMessage('Identifiant de certificat invalide')],
  CertificatController.download
);

export default router;