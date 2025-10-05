import { Router, Request, Response, NextFunction } from 'express';
import * as CoursController from '../controllers/course/CoursController';
import * as ContenuController from '../controllers/course/ContenuController';
import * as QuizController from '../controllers/course/QuizController';
import * as DomaineController from '../controllers/course/DomaineController';
import Domaine from '../models/course/Domaine';
import authMiddleware from '../middleware/auth';
import authorize from '../middleware/authorization';
import validate from '../middleware/validation';
import * as courseValidator from '../validators/courseValidator';
import upload from '../middleware/upload';
import { RoleUtilisateur } from '../models/user/User';
import createError from 'http-errors';

const router: Router = Router();

// Routes pour Domaine
router.post(
  '/domaine',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  validate(courseValidator.createDomaine),
  DomaineController.create as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

router.get('/domaine', DomaineController.getAll as (req: Request, res: Response, next: NextFunction) => Promise<void>);

router.get('/domaine/:id', DomaineController.getById as (req: Request, res: Response, next: NextFunction) => Promise<void>);

router.put(
  '/domaine/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  validate(courseValidator.updateDomaine),
  DomaineController.update as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

router.delete(
  '/domaine/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  DomaineController.delete as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

// Route for domain statistics
router.get(
  '/domaine/:id/stats',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const domaine = await Domaine.findById(req.params.id);
      if (!domaine) throw createError(404, 'Domaine non trouvé');
      const stats = await domaine.getStatistiques();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }
);

// Routes pour Cours
router.post(
  '/',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  validate(courseValidator.create),
  CoursController.create as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

router.get('/', CoursController.getAll as (req: Request, res: Response, next: NextFunction) => Promise<void>);

router.get('/:id', CoursController.getById as (req: Request, res: Response, next: NextFunction) => Promise<void>);

router.put(
  '/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  validate(courseValidator.update),
  CoursController.update as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

router.delete(
  '/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  CoursController.delete as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

// Routes pour Contenu (commented out as in original)
/*
router.post(
  '/contenu',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  upload.single('file'),
  validate(courseValidator.createContenu),
  ContenuController.create as (req: Request, res: Response, next: NextFunction) => Promise<void>
);
*/

router.get(
  '/contenu/:id',
  authMiddleware,
  ContenuController.getById as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

/*
router.put(
  '/contenu/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  upload.single('file'),
  validate(courseValidator.updateContenu),
  ContenuController.update as (req: Request, res: Response, next: NextFunction) => Promise<void>
);
*/

router.delete(
  '/contenu/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  ContenuController.delete as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

// Routes pour Quiz
router.post(
  '/quiz',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  validate(courseValidator.createQuiz),
  QuizController.create as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

router.get(
  '/quiz/:id',
  authMiddleware,
  QuizController.getById as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

router.put(
  '/quiz/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  validate(courseValidator.updateQuiz),
  QuizController.update as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

router.delete(
  '/quiz/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  QuizController.delete as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

// Route for learners to submit quiz answers
router.post(
  '/quiz/:id/soumettre',
  authMiddleware,
  authorize([RoleUtilisateur.ETUDIANT]),
  QuizController.soumettre as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

export default router;