// src/routes/instructeurs.js - VERSION CORRIGÉE
import { Router } from 'express';
import { 
  getDomaines,
  getCourses, 
  createCourse, 
  updateCourse, 
  submitForApproval, 
  getCoursesInProgress, 
  getProfile,
  getInstructeurs,
  getTotalStudents, // NOUVELLE IMPORTATION
  getTotalStudentsByInstructor // NOUVELLE IMPORTATION
} from '../controllers/user/InstructeurController';
import authMiddleware from '../middleware/auth';
import authorize from '../middleware/authorization';
import { RoleUtilisateur } from '../types';

const router = Router();

// === NOUVELLES ROUTES POUR LES STATISTIQUES ÉTUDIANTS ===

// Route pour le nombre total d'étudiants (selon le rôle)
router.get(
  '/stats/total-students',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN, RoleUtilisateur.ENSEIGNANT]),
  getTotalStudents
);

// Route pour le nombre d'étudiants par instructeur spécifique
router.get(
  '/:id/stats/total-students',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN, RoleUtilisateur.ENSEIGNANT]),
  getTotalStudentsByInstructor
);

// ROUTE EXISTANTE : Récupérer tous les instructeurs (ENSEIGNANTS)
router.get(
  '/',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN, RoleUtilisateur.ENSEIGNANT]),
  getInstructeurs
);

// Route pour les domaines
router.get(
  '/domaines',
  authMiddleware,
  authorize([RoleUtilisateur.ENSEIGNANT, RoleUtilisateur.ADMIN]),
  getDomaines
);

// Routes existantes pour les cours par instructeur
router.get(
  '/:id/courses',
  authMiddleware,
  authorize([RoleUtilisateur.ENSEIGNANT, RoleUtilisateur.ADMIN]),
  getCourses
);

router.post(
  '/:id/courses',
  authMiddleware,
  authorize([RoleUtilisateur.ENSEIGNANT, RoleUtilisateur.ADMIN]),
  createCourse
);

router.put(
  '/:id/courses/:courseId',
  authMiddleware,
  authorize([RoleUtilisateur.ENSEIGNANT, RoleUtilisateur.ADMIN]),
  updateCourse
);

router.post(
  '/:id/courses/:courseId/submit',
  authMiddleware,
  authorize([RoleUtilisateur.ENSEIGNANT, RoleUtilisateur.ADMIN]),
  submitForApproval
);

router.get(
  '/:id/courses-in-progress',
  authMiddleware,
  authorize([RoleUtilisateur.ENSEIGNANT, RoleUtilisateur.ADMIN]),
  getCoursesInProgress
);

router.get(
  '/:id/profile',
  authMiddleware,
  authorize([RoleUtilisateur.ENSEIGNANT, RoleUtilisateur.ADMIN]),
  getProfile
);

export default router;