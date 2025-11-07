import { Router, Request, Response, NextFunction } from 'express';
import CoursController from '../controllers/course/CoursController';
import ContenuController from '../controllers/course/ContenuController';
import QuizController from '../controllers/course/QuizController';
import DomaineController from '../controllers/course/DomaineController';
import Domaine from '../models/course/Domaine';
import authMiddleware from '../middleware/auth';
import authorize from '../middleware/authorization';
import validate from '../middleware/validation';
import * as courseValidator from '../validators/courseValidator';
import { uploadFile } from '../middleware/uploadFile'; // <-- Utilisation du middleware corrigé
import { RoleUtilisateur } from '../types';
import createError from 'http-errors';

const router: Router = Router();

// === DOMAINES ===
router.post(
  '/domaine',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  validate(courseValidator.createDomaine),
  DomaineController.create
);

router.get('/domaine', DomaineController.getAll);

router.get('/domaine/:id', DomaineController.getById);

router.put(
  '/domaine/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  validate(courseValidator.updateDomaine),
  DomaineController.update
);

router.delete(
  '/domaine/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  DomaineController.delete
);

// Statistiques du domaine
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

// === COURS ===
router.post(
  '/',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  validate(courseValidator.create),
  CoursController.create
);

router.get('/', CoursController.getAll);

router.get('/:id', CoursController.getById);

router.put(
  '/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  validate(courseValidator.update),
  CoursController.update
);

router.delete(
  '/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  CoursController.delete
);

// === CONTENU (avec upload de fichier) ===
router.post(
  '/contenu',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  uploadFile, // <-- Upload vidéo/document/image
  validate(courseValidator.createContenu),
  ContenuController.create
);

router.get('/contenu/:id', authMiddleware, ContenuController.getById);

router.put(
  '/contenu/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  uploadFile, // <-- Optionnel : si mise à jour avec nouveau fichier
  validate(courseValidator.updateContenu),
  ContenuController.update
);

router.delete(
  '/contenu/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  ContenuController.delete
);

// === QUIZ ===
router.post(
  '/quiz',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  validate(courseValidator.createQuiz),
  QuizController.create
);

router.get('/quiz/:id', authMiddleware, QuizController.getById);

router.put(
  '/quiz/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  validate(courseValidator.updateQuiz),
  QuizController.update
);

router.delete(
  '/quiz/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  QuizController.delete
);

// Soumission de quiz par étudiant
router.post(
  '/quiz/:id/soumettre',
  authMiddleware,
  authorize([RoleUtilisateur.ETUDIANT]),
  validate(courseValidator.submitQuiz),
  QuizController.soumettre
);

export default router;