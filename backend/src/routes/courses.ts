// Corrected Router
// Fixes:
// - Added missing routes for /stats and /public (for public courses).
// - No auth for /public to allow anonymous access.
// - Added conditions for role-based access where necessary.
// - Improved professional structure with comments.

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
import { RoleUtilisateur } from '../types';
import createError from 'http-errors';

const router: Router = Router();

/* -------------------- 🔷 ROUTES DOMAINE -------------------- */
// Créer un domaine (admin seulement)
router.post(
  '/domaine',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  validate(courseValidator.createDomaine),
  DomaineController.create
);

// Récupérer tous les domaines (public)
router.get('/domaine', DomaineController.getAll);

// Récupérer un domaine par ID (public)
router.get('/domaine/:id', DomaineController.getById);

// Mettre à jour un domaine (admin)
router.put(
  '/domaine/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  validate(courseValidator.updateDomaine),
  DomaineController.update
);

// Supprimer un domaine (admin)
router.delete(
  '/domaine/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  DomaineController.delete
);

// Stats d'un domaine (admin)
router.get(
  '/domaine/:id/stats',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const domaine = await Domaine.findById(req.params.id);
      if (!domaine) throw createError(404, 'Domaine non trouvé');
      const stats = await domaine.getStatistiques(); // Assume getStatistiques is implemented in model
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }
);

/* -------------------- 🔷 ROUTES COURS -------------------- */
// Mes cours (étudiant)
router.get(
  '/my-courses',
  authMiddleware,
  authorize([RoleUtilisateur.ETUDIANT]),
  CoursController.getMyCourses
);

// Créer un cours (admin)
router.post(
  '/',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  validate(courseValidator.create),
  CoursController.create
);

// Récupérer tous les cours (admin)
router.get(
  '/',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  CoursController.getAll
);

// Récupérer les cours publics (pas d'auth requis)
router.get('/public', CoursController.getPublicCourses);

// Récupérer les stats des cours (admin)
router.get(
  '/stats',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  CoursController.getStats
);

// Récupérer un cours par ID (public si publié, sinon auth)
router.get('/:id', CoursController.getById);

// Mettre à jour un cours (admin)
router.put(
  '/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  validate(courseValidator.update),
  CoursController.update
);

// Supprimer un cours (admin)
router.delete(
  '/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  CoursController.delete
);

/* -------------------- 🔷 ROUTES CONTENU -------------------- */
// Récupérer contenu par ID (auth)
router.get('/contenu/:id', authMiddleware, ContenuController.getById);

// Supprimer contenu (admin)
router.delete(
  '/contenu/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  ContenuController.delete
);

/* -------------------- 🔷 ROUTES QUIZ -------------------- */
// Créer quiz (admin)
router.post(
  '/quiz',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  validate(courseValidator.createQuiz),
  QuizController.create
);

// Récupérer quiz par ID (auth)
router.get('/quiz/:id', authMiddleware, QuizController.getById);

// Mettre à jour quiz (admin)
router.put(
  '/quiz/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  validate(courseValidator.updateQuiz),
  QuizController.update
);

// Supprimer quiz (admin)
router.delete(
  '/quiz/:id',
  authMiddleware,
  authorize([RoleUtilisateur.ADMIN]),
  QuizController.delete
);

// Soumettre quiz (étudiant)
router.post(
  '/quiz/:id/soumettre',
  authMiddleware,
  authorize([RoleUtilisateur.ETUDIANT]),
  QuizController.soumettre
);

export default router;