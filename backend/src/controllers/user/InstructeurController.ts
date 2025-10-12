import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import mongoose, { Types } from 'mongoose';
import { User } from '../../models/user/User';
import Cours from '../../models/course/Cours';
import {
  UserDocument,
  CourseDocument,
  RoleUtilisateur,
} from '../../types';

/**
 * Contrôleur pour gérer les fonctionnalités des instructeurs.
 */
class InstructeurController {
  /**
   * Récupère les cours créés par un instructeur.
   */
  static getCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const instructeur = await User.findById(id)
        .populate<{ coursCrees: CourseDocument[] }>('coursCrees', 'titre niveau domaineId statutApprobation')
        .lean<UserDocument>();

      if (!instructeur || instructeur.role !== RoleUtilisateur.ENSEIGNANT) {
        throw createError(404, 'Instructeur non trouvé');
      }

      res.json({
        success: true,
        data: instructeur.coursCrees,
        message: 'Cours récupérés avec succès',
      });
    } catch (err) {
      console.error('Erreur lors de la récupération des cours:', (err as Error).message);
      next(err);
    }
  };

  /**
   * Crée un nouveau cours pour un instructeur.
   */
  static createCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!req.user || (req.user.id !== id && req.user.role !== RoleUtilisateur.ADMIN)) {
        throw createError(403, 'Accès non autorisé');
      }

      const { titre, description, duree, domaineId, niveau, contenu, quizzes } = req.body;

      if (!titre || !duree || !domaineId || !niveau) {
        throw createError(400, 'Les champs titre, durée, domaineId et niveau sont requis');
      }

      // Création du cours
      const cours = await Cours.create({
        titre,
        description: description || '',
        duree,
        domaineId: new Types.ObjectId(domaineId),
        createur: new Types.ObjectId(id),
        niveau,
        contenu: contenu || null,
        quizzes: quizzes || [],
        statutApprobation: 'PENDING',
        estPublie: false,
      });

      // Récupération de l'instructeur
      const instructeur = await User.findById(id) as UserDocument;
      if (!instructeur) {
        throw createError(404, 'Instructeur non trouvé');
      }

      // ✅ Correction TypeScript ici
      instructeur.coursEnCoursEdition?.push(cours._id as mongoose.Types.ObjectId);

      await instructeur.save();

      res.status(201).json({
        success: true,
        data: cours,
        message: 'Cours créé avec succès',
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Met à jour un cours créé par un instructeur.
   */
  static updateCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, courseId } = req.params;

      if (!req.user || (req.user.id !== id && req.user.role !== RoleUtilisateur.ADMIN)) {
        throw createError(403, 'Accès non autorisé');
      }

      const { titre, description, duree, domaineId, niveau, contenu, quizzes, statutApprobation, estPublie } = req.body;

      const updates: Partial<CourseDocument> = {};
      if (titre) updates.titre = titre;
      if (description) updates.description = description;
      if (duree !== undefined) updates.duree = duree;
      if (domaineId) updates.domaineId = new Types.ObjectId(domaineId);
      if (niveau) updates.niveau = niveau;
      if (contenu) updates.contenu = contenu;
      if (quizzes) updates.quizzes = quizzes;
      if (statutApprobation) updates.statutApprobation = statutApprobation;
      if (estPublie !== undefined) updates.estPublie = estPublie;

      const cours = await Cours.findByIdAndUpdate(
        new Types.ObjectId(courseId),
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!cours) {
        throw createError(404, 'Cours non trouvé');
      }

      res.json({
        success: true,
        data: cours,
        message: 'Cours mis à jour avec succès',
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Soumet un cours pour approbation.
   */
  static submitForApproval = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, courseId } = req.params;

      if (!req.user || (req.user.id !== id && req.user.role !== RoleUtilisateur.ADMIN)) {
        throw createError(403, 'Accès non autorisé');
      }

      const instructeur = await User.findById(id);
      if (!instructeur || instructeur.role !== RoleUtilisateur.ENSEIGNANT) {
        throw createError(404, 'Instructeur non trouvé');
      }

      const courseIndex = instructeur.coursEnCoursEdition.indexOf(new Types.ObjectId(courseId));
      if (courseIndex === -1) {
        throw createError(400, 'Cours non en cours d\'édition');
      }

      instructeur.coursEnCoursEdition.splice(courseIndex, 1);
      instructeur.coursCrees.push(new Types.ObjectId(courseId));
      await instructeur.save();

      const cours = await Cours.findByIdAndUpdate(
        new Types.ObjectId(courseId),
        { $set: { statutApprobation: 'PENDING' } },
        { new: true }
      );

      if (!cours) {
        throw createError(404, 'Cours non trouvé');
      }

      res.json({
        success: true,
        data: cours,
        message: 'Cours soumis pour approbation avec succès',
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Récupère les cours en cours d'édition par un instructeur.
   */
  static getCoursesInProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const instructeur = await User.findById(id)
        .populate<{ coursEnCoursEdition: CourseDocument[] }>('coursEnCoursEdition', 'titre niveau domaineId')
        .lean<UserDocument>();

      if (!instructeur || instructeur.role !== RoleUtilisateur.ENSEIGNANT) {
        throw createError(404, 'Instructeur non trouvé');
      }

      res.json({
        success: true,
        data: instructeur.coursEnCoursEdition,
        message: 'Cours en cours récupérés avec succès',
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Récupère le profil d'un instructeur.
   */
  static getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const instructeur = await User.findById(id)
        .populate<{ coursCrees: CourseDocument[], coursEnCoursEdition: CourseDocument[] }>('coursCrees coursEnCoursEdition')
        .select('-password')
        .lean<UserDocument>();

      if (!instructeur || instructeur.role !== RoleUtilisateur.ENSEIGNANT) {
        throw createError(404, 'Instructeur non trouvé');
      }

      res.json({
        success: true,
        data: instructeur,
        message: 'Profil récupéré avec succès',
      });
    } catch (err) {
      next(err);
    }
  };
}

// ✅ Export des méthodes individuelles
export const getCourses = InstructeurController.getCourses;
export const createCourse = InstructeurController.createCourse;
export const updateCourse = InstructeurController.updateCourse;
export const submitForApproval = InstructeurController.submitForApproval;
export const getCoursesInProgress = InstructeurController.getCoursesInProgress;
export const getProfile = InstructeurController.getProfile;
