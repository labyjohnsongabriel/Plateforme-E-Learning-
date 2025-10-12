import { Router } from 'express';
import { getCourses, createCourse, updateCourse, submitForApproval, getCoursesInProgress, getProfile } from '../controllers/user/InstructeurController';
import authMiddleware from '../middleware/auth';
import authorize from '../middleware/authorization';
import { RoleUtilisateur } from '../types';

const router = Router();

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