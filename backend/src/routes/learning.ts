import { Router } from 'express';
import authMiddleware from '../middleware/auth';
import authorize from '../middleware/authorization';
import validate from '../middleware/validation';
import * as learningValidator from '../validators/learningValidator';
import { RoleUtilisateur } from '../models/user/User';
import InscriptionController from '../controllers/learning/InscriptionController';
import ProgressionController from '../controllers/learning/ProgressionController';
import CertificatController from '../controllers/learning/CertificatController';

const router = Router();

// --- Routes pour inscriptions ---
router.post(
  '/enroll',
  authMiddleware,
  authorize([RoleUtilisateur.ETUDIANT]),
 // validate(learningValidator.enroll), // tableau de ValidationChain
  InscriptionController.enroll
);

router.get(
  '/enrollments',
  authMiddleware,
  authorize([RoleUtilisateur.ETUDIANT]),
  InscriptionController.getUserEnrollments
);

router.put(
  '/enrollment/:id/status',
  authMiddleware,
  authorize([RoleUtilisateur.ETUDIANT]),
  InscriptionController.updateStatus
);

router.delete(
  '/enrollment/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ETUDIANT]),
  InscriptionController.delete // ok, le controller gère l'appel
);

// --- Routes pour progressions ---
router.get(
  '/progress/:coursId',
  authMiddleware,
  authorize([RoleUtilisateur.ETUDIANT]),
  ProgressionController.getByUserAndCourse
);

router.put(
  '/progress/:coursId',
  authMiddleware,
  authorize([RoleUtilisateur.ETUDIANT]),
  //validate(learningValidator.updateProgress),
  ProgressionController.update
);

// --- Routes pour certificats ---
router.get(
  '/certificates',
  authMiddleware,
  authorize([RoleUtilisateur.ETUDIANT]),
  CertificatController.getByUser
);

router.get(
  '/certificate/:id/download',
  authMiddleware,
  authorize([RoleUtilisateur.ETUDIANT]),
  CertificatController.download
);

export default router;
