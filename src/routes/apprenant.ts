import { Router, Request, Response, NextFunction } from 'express';
import * as AdminController from '../controllers/user/AdministrateurController';
import authMiddleware from '../middleware/auth';
import authorize from '../middleware/authorize';
import { RoleUtilisateur } from '../../src//models/enums/RoleUtilisateur'; // Mise à jour pour utiliser types/index.ts

const router: Router = Router();

// Stats
router.get(
  '/stats/global',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  AdminController.getGlobalStats
);

router.get(
  '/stats/user/:userId',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  AdminController.getUserStats
);

router.get(
  '/stats/course/:coursId',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  AdminController.getCourseStats
);

// Gestion des utilisateurs
router.get(
  '/users',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  AdminController.getAllUsers
);

router.put(
  '/users/:userId',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  AdminController.updateUser
);

router.delete(
  '/users/:userId',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  AdminController.deleteUser
);

// Gestion des cours
router.post(
  '/courses',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  AdminController.createCourse
);

router.get(
  '/courses',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  AdminController.getAllCourses
);

router.put(
  '/courses/:coursId',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  AdminController.updateCourse
);

router.delete(
  '/courses/:coursId',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  AdminController.deleteCourse
);

export default router;