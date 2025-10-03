import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { User } from '../../models/user/User';
import { CoursService } from '../../services/learning/CoursService';
import { UserDocument, CourseDocument, CourseCreateData, CourseUpdateData, ApprovalData } from '../../types';

/**
 * Contrôleur pour gérer les fonctionnalités des instructeurs.
 */
class InstructeurController {
  /**
   * Récupère les cours créés par un instructeur.
   * @param req - Requête Express avec paramètre ID
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static getCourses = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const instructeur = await User.findById(req.params.id)
        .populate<{ coursCrees: CourseDocument[] }>('coursCrees', 'titre niveau domaine statutApprobation')
        .lean();
      if (!instructeur || instructeur.role !== 'INSTRUCTEUR') {
        throw createError(404, 'Instructeur non trouvé');
      }
      res.json(instructeur.coursCrees);
    } catch (err) {
      console.error('Erreur lors de la récupération des cours:', (err as Error).message);
      next(err);
    }
  };

  /**
   * Crée un nouveau cours pour un instructeur.
   * @param req - Requête Express avec paramètre ID, corps et utilisateur authentifié
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static createCourse = async (req: Request<{ id: string }, {}, CourseCreateData>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || req.user.id !== req.params.id && req.user.role !== 'admin') {
        throw createError(403, 'Accès non autorisé');
      }
      const { titre, description, niveau, domaine, contenu } = req.body;
      const instructeurId = req.params.id;
      const cours = await CoursService.createCourse(
        { titre, description, niveau, domaine, contenu, statutApprobation: 'PENDING' },
        instructeurId
      );
      const instructeur = await User.findById(instructeurId);
      if (instructeur) {
        instructeur.coursEnCoursEdition.push(cours._id);
        await instructeur.save();
      }
      res.status(201).json(cours);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Met à jour un cours créé par un instructeur.
   * @param req - Requête Express avec paramètre ID, corps et utilisateur authentifié
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static updateCourse = async (req: Request<{ id: string }, {}, CourseUpdateData>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || req.user.id !== req.params.id && req.user.role !== 'admin') {
        throw createError(403, 'Accès non autorisé');
      }
      const { coursId, titre, description, niveau, domaine, contenu } = req.body;
      const instructeurId = req.params.id;
      const cours = await CoursService.updateCourse(coursId, { titre, description, niveau, domaine, contenu }, instructeurId);
      res.json(cours);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Soumet un cours pour approbation.
   * @param req - Requête Express avec paramètre ID, corps et utilisateur authentifié
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static submitForApproval = async (req: Request<{ id: string }, {}, ApprovalData>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || req.user.id !== req.params.id && req.user.role !== 'admin') {
        throw createError(403, 'Accès non autorisé');
      }
      const { coursId } = req.body;
      const instructeurId = req.params.id;
      const instructeur = await User.findById(instructeurId);
      if (!instructeur || instructeur.role !== 'INSTRUCTEUR') {
        throw createError(404, 'Instructeur non trouvé');
      }
      const courseIndex = instructeur.coursEnCoursEdition.indexOf(coursId);
      if (courseIndex === -1) {
        throw createError(400, 'Cours non en cours d\'édition');
      }
      instructeur.coursEnCoursEdition.splice(courseIndex, 1);
      instructeur.coursCrees.push(coursId);
      await instructeur.save();
      const cours = await CoursService.updateCourse(coursId, { statutApprobation: 'PENDING' }, instructeurId);
      res.json(cours);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Récupère les cours en cours d'édition par un instructeur.
   * @param req - Requête Express avec paramètre ID
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static getCoursesInProgress = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const instructeur = await User.findById(req.params.id)
        .populate<{ coursEnCoursEdition: CourseDocument[] }>('coursEnCoursEdition', 'titre niveau domaine')
        .lean();
      if (!instructeur || instructeur.role !== 'INSTRUCTEUR') {
        throw createError(404, 'Instructeur non trouvé');
      }
      res.json(instructeur.coursEnCoursEdition);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Récupère le profil d'un instructeur.
   * @param req - Requête Express avec paramètre ID
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static getProfile = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const instructeur = await User.findById(req.params.id)
        .populate<{ coursCrees: CourseDocument[], coursEnCoursEdition: CourseDocument[] }>('coursCrees coursEnCoursEdition')
        .select('-motDePasse')
        .lean();
      if (!instructeur || instructeur.role !== 'INSTRUCTEUR') {
        throw createError(404, 'Instructeur non trouvé');
      }
      res.json(instructeur);
    } catch (err) {
      next(err);
    }
  };
}

export default InstructeurController;