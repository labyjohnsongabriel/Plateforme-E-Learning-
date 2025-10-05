import { Router, Request, Response, NextFunction } from 'express';
import * as InscriptionController from '../controllers/learning/InscriptionController';
import * as ProgressionController from '../controllers/learning/ProgressionController';
import * as CertificatController from '../controllers/learning/CertificatController';
import authMiddleware from '../middleware/auth';
import authorize from '../middleware/authorize';
import validate from '../middleware/validate';
import * as learningValidator from '../validators/learningValidator';
import { RoleUtilisateur } from '../models/user/User';

const router: Router = Router();

// Routes pour inscriptions
router.post(
  '/enroll',
  authMiddleware,
  authorize([RoleUtilisateur.ETUDIANT]),
  validate(learningValidator.enroll),
  InscriptionController.enroll as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

router.get(
  '/enrollments',
  authMiddleware,
  authorize([RoleUtilisateur.ETUDIANT]),
  InscriptionController.getUserEnrollments as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

router.put(
  '/enrollment/:id/status',
  authMiddleware,
  authorize([RoleUtilisateur.ETUDIANT]),
  InscriptionController.updateStatus as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

router.delete(
  '/enrollment/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ETUDIANT]),
  InscriptionController.delete as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

// Routes pour progressions
router.get(
  '/progress/:coursId',
  authMiddleware,
  authorize([RoleUtilisateur.ETUDIANT]),
  ProgressionController.getByUserAndCourse as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

router.put(
  '/progress/:coursId',
  authMiddleware,
  authorize([RoleUtilisateur.ETUDIANT]),
  validate(learningValidator.updateProgress),
  ProgressionController.update as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

// Routes pour certificats
router.get(
  '/certificates',
  authMiddleware,
  authorize([RoleUtilisateur.ETUDIANT]),
  CertificatController.getByUser as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

router.get(
  '/certificate/:id/download',
  authMiddleware,
  authorize([RoleUtilisateur.ETUDIANT]),
  CertificatController.download as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

export default router;