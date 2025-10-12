// Router pour admin (corrigé avec ajout de get /courses/:coursId)
import { Router } from 'express';
import AdministrateurController from '../controllers/user/AdministrateurController';
import authMiddleware from '../middleware/auth';
import authorize from '../middleware/authorization';
import { RoleUtilisateur } from '../types';

const router = Router();

// Admin Statistics Routes
router.get(
  '/stats/global',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  AdministrateurController.getGlobalStats
);

router.get(
  '/stats/user/:userId',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  AdministrateurController.getUserStats
);

router.get(
  '/stats/course/:coursId',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  AdministrateurController.getCourseStats
);

// User Management Routes
router.get(
  '/users',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  AdministrateurController.getAllUsers
);

router.put(
  '/users/:userId',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  AdministrateurController.updateUser
);

router.delete(
  '/users/:userId',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  AdministrateurController.deleteUser
);

// Course Management Routes
router.post(
  '/courses',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  AdministrateurController.createCourse
);

router.get(
  '/courses',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  AdministrateurController.getAllCourses
);

router.get(
  '/courses/:coursId',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  AdministrateurController.getCourseById
);

router.put(
  '/courses/:coursId',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  AdministrateurController.updateCourse
);

router.delete(
  '/courses/:coursId',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  AdministrateurController.deleteCourse
);

export default router;