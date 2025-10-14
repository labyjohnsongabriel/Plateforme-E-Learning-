// src/routes/learning.ts
import { Router } from 'express';
import authMiddleware from '../middleware/auth';
import authorize from '../middleware/authorization';
import { RoleUtilisateur } from '../models/user/User';
import InscriptionController from '../controllers/learning/InscriptionController';
import ProgressionController from '../controllers/learning/ProgressionController';
import CertificatController from '../controllers/learning/CertificatController';

const router = Router();

// Middleware d'authentification et d'autorisation pour toutes les routes
const restrictToEtudiant = [authMiddleware, authorize([RoleUtilisateur.ETUDIANT])];

// Inscriptions
router.post('/enroll', ...restrictToEtudiant, InscriptionController.enroll);
router.get('/enrollments', ...restrictToEtudiant, InscriptionController.getUserEnrollments);
router.put('/enrollment/:id/status', ...restrictToEtudiant, InscriptionController.updateStatus);
router.delete('/enrollment/:id', ...restrictToEtudiant, InscriptionController.delete);

// Progressions
router.get('/progress/global', ...restrictToEtudiant, ProgressionController.getGlobalProgress);
router.get('/progress/:coursId', ...restrictToEtudiant, ProgressionController.getByUserAndCourse);
router.put('/progress/:coursId', ...restrictToEtudiant, ProgressionController.update);

// Certificats
router.get('/certificates', ...restrictToEtudiant, CertificatController.getByUser);
router.get('/certificate/:id/download', ...restrictToEtudiant, CertificatController.download);

export default router;