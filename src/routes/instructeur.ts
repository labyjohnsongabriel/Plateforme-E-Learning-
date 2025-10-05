import { Router, Request, Response, NextFunction } from 'express';
import * as InstructeurController from '../controllers/user/InstructeurController';
import authMiddleware from '../middleware/auth';
import authorize from '../middleware/authorize';
import { RoleUtilisateur } from '../models/user/User';

const router: Router = Router();

router.get(
  '/:id/courses',
  authMiddleware,
  authorize([RoleUtilisateur.ENSEIGNANT]),
  InstructeurController.getCourses as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

router.post(
  '/:id/courses',
  authMiddleware,
  authorize([RoleUtilisateur.ENSEIGNANT]),
  InstructeurController.createCourse as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

router.put(
  '/:id/courses',
  authMiddleware,
  authorize([RoleUtilisateur.ENSEIGNANT]),
  InstructeurController.updateCourse as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

router.post(
  '/:id/courses/submit',
  authMiddleware,
  authorize([RoleUtilisateur.ENSEIGNANT]),
  InstructeurController.submitForApproval as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

router.get(
  '/:id/courses-in-progress',
  authMiddleware,
  authorize([RoleUtilisateur.ENSEIGNANT]),
  InstructeurController.getCoursesInProgress as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

router.get(
  '/:id/profile',
  authMiddleware,
  authorize([RoleUtilisateur.ENSEIGNANT]),
  InstructeurController.getProfile as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

export default router;