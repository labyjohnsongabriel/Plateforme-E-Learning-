import { Router, Request, Response, NextFunction } from 'express';
import ModuleController from '../controllers/course/ModuleController';
import authMiddleware from '../middleware/auth';
import authorize from '../middleware/authorization';
import validate from '../middleware/validation';
import { RoleUtilisateur } from '../types';
import { createModule, updateModule } from '../validators/moduleValidator';

const router: Router = Router();

router.get(
  '/',
  authMiddleware,
  ModuleController.getByCourseId
);

router.get(
  '/:id',
  authMiddleware,
  ModuleController.getById
);

router.post(
  '/',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN, RoleUtilisateur.ENSEIGNANT]),
  validate(createModule),
  ModuleController.create
);

router.put(
  '/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN, RoleUtilisateur.ENSEIGNANT]),
  validate(updateModule),
  ModuleController.update
);

router.delete(
  '/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN, RoleUtilisateur.ENSEIGNANT]),
  ModuleController.delete
);

export default router;