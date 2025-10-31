// src/controllers/user/InstructeurController.ts
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import mongoose, { Types } from 'mongoose';
import { User } from '../../models/user/User';
import Cours from '../../models/course/Cours';
import Domaine from '../../models/course/Domaine';
import {
  UserDocument,
  CourseDocument,
  RoleUtilisateur,
} from '../../types';

class InstructeurController {
  static getDomaines = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const domaines = await Domaine.find({}).lean();
      res.json({
        success: true,
        data: domaines,
        message: 'Domaines récupérés avec succès',
      });
    } catch (err) {
      next(err);
    }
  };

  static getCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw createError(400, 'ID instructeur invalide');
      }

      const instructeur = await User.findById(id)
        .populate<{ coursCrees: CourseDocument[] }>({
          path: 'coursCrees',
          select: 'titre description niveau domaineId statutApprobation estPublie duree createdAt contenu',
          populate: { path: 'domaineId', select: 'nom' },
        })
        .lean<UserDocument>();

      if (!instructeur || instructeur.role !== RoleUtilisateur.ENSEIGNANT) {
        throw createError(404, 'Instructeur non trouvé');
      }

      res.json({
        success: true,
        data: instructeur.coursCrees || [],
        message: 'Cours récupérés avec succès',
      });
    } catch (err) {
      next(err);
    }
  };

  static createCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw createError(400, 'ID instructeur invalide');
      }

      if (!req.user || (req.user.id !== id && req.user.role !== RoleUtilisateur.ADMIN)) {
        throw createError(403, 'Accès non autorisé');
      }

      const { titre, description, duree, domaineId, niveau, contenu, quizzes, estPublie, statutApprobation } = req.body;

      if (!titre || !duree || !domaineId || !niveau) {
        throw createError(400, 'Les champs titre, durée, domaineId et niveau sont requis');
      }

      if (!mongoose.Types.ObjectId.isValid(domaineId)) {
        throw createError(400, 'ID de domaine invalide');
      }

      const domaineExists = await Domaine.findById(domaineId);
      if (!domaineExists) {
        throw createError(400, 'Domaine non trouvé');
      }

      const instructeur = await User.findById(id) as UserDocument;
      if (!instructeur || instructeur.role !== RoleUtilisateur.ENSEIGNANT) {
        throw createError(404, 'Instructeur non trouvé');
      }

      // Validation du contenu
      let parsedContenu: any = undefined;
      if (contenu !== undefined) {
        if (contenu === null) {
          parsedContenu = null;
        } else if (contenu.sections && Array.isArray(contenu.sections)) {
          parsedContenu = { sections: contenu.sections };
        } else {
          throw createError(400, 'Format de contenu invalide : doit avoir une propriété "sections" (tableau)');
        }
      }

      const courseData: any = {
        titre: titre.trim(),
        description: description?.trim() ?? '',
        duree: Number(duree),
        domaineId: new Types.ObjectId(domaineId),
        instructeurId: new Types.ObjectId(id),
        createur: new Types.ObjectId(id),
        niveau,
        statutApprobation: statutApprobation || 'PENDING',
        estPublie: estPublie === true,
        etudiants: [],
        quizzes: quizzes || [],
        progression: 0,
        contenu: parsedContenu,
      };

      const cours = await Cours.create(courseData);

      if (!instructeur.coursCrees) instructeur.coursCrees = [];
      if (!instructeur.coursEnCoursEdition) instructeur.coursEnCoursEdition = [];

      instructeur.coursCrees.push(cours._id as mongoose.Types.ObjectId);
      await instructeur.save();

      const coursPopulated = await Cours.findById(cours._id)
        .populate('domaineId', 'nom')
        .lean();

      res.status(201).json({
        success: true,
        data: coursPopulated,
        message: 'Cours créé avec succès',
      });
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e: any) => e.message).join(', ');
        return next(createError(400, `Erreurs de validation: ${messages}`));
      }
      if (err.name === 'CastError') {
        return next(createError(400, `Données invalides: ${err.message}`));
      }
      next(err);
    }
  };

  static updateCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, courseId } = req.params;
      if (!id || !courseId || !mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(courseId)) {
        throw createError(400, 'ID invalide');
      }

      if (!req.user || (req.user.id !== id && req.user.role !== RoleUtilisateur.ADMIN)) {
        throw createError(403, 'Accès non autorisé');
      }

      const coursExistant = await Cours.findById(courseId);
      if (!coursExistant) {
        throw createError(404, 'Cours non trouvé');
      }

      const { titre, description, duree, domaineId, niveau, contenu, quizzes, statutApprobation, estPublie } = req.body;
      const updates: any = {};

      if (titre !== undefined) updates.titre = titre.trim();
      if (description !== undefined) updates.description = description.trim();
      if (duree !== undefined) updates.duree = Number(duree);
      if (niveau) updates.niveau = niveau;
      if (quizzes !== undefined) updates.quizzes = quizzes;
      if (statutApprobation) updates.statutApprobation = statutApprobation;
      if (estPublie !== undefined) updates.estPublie = estPublie;

      if (domaineId) {
        if (!mongoose.Types.ObjectId.isValid(domaineId)) {
          throw createError(400, 'ID de domaine invalide');
        }
        const domaineExists = await Domaine.findById(domaineId);
        if (!domaineExists) throw createError(400, 'Domaine non trouvé');
        updates.domaineId = new Types.ObjectId(domaineId);
      }

      if (contenu !== undefined) {
        if (contenu === null) {
          updates.contenu = null;
        } else if (contenu.sections && Array.isArray(contenu.sections)) {
          updates.contenu = { sections: contenu.sections };
        } else {
          throw createError(400, 'Format de contenu invalide : doit avoir une propriété "sections" (tableau)');
        }
      }

      const cours = await Cours.findByIdAndUpdate(
        courseId,
        { $set: updates },
        { new: true, runValidators: true }
      ).populate('domaineId', 'nom');

      if (!cours) throw createError(404, 'Cours non trouvé');

      res.json({
        success: true,
        data: cours,
        message: 'Cours mis à jour avec succès',
      });
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e: any) => e.message).join(', ');
        return next(createError(400, `Erreurs de validation: ${messages}`));
      }
      if (err.name === 'CastError') {
        return next(createError(400, `Données invalides: ${err.message}`));
      }
      next(err);
    }
  };

  static submitForApproval = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, courseId } = req.params;
      if (!id || !courseId || !mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(courseId)) {
        throw createError(400, 'ID invalide');
      }

      if (!req.user || (req.user.id !== id && req.user.role !== RoleUtilisateur.ADMIN)) {
        throw createError(403, 'Accès non autorisé');
      }

      const instructeur = await User.findById(id);
      if (!instructeur || instructeur.role !== RoleUtilisateur.ENSEIGNANT) {
        throw createError(404, 'Instructeur non trouvé');
      }

      const cours = await Cours.findById(courseId);
      if (!cours) throw createError(404, 'Cours non trouvé');

      if (!instructeur.coursEnCoursEdition) instructeur.coursEnCoursEdition = [];
      if (!instructeur.coursCrees) instructeur.coursCrees = [];

      const index = instructeur.coursEnCoursEdition.findIndex(c => c.toString() === courseId);
      if (index !== -1) {
        instructeur.coursEnCoursEdition.splice(index, 1);
        if (!instructeur.coursCrees.some(c => c.toString() === courseId)) {
          instructeur.coursCrees.push(new Types.ObjectId(courseId));
        }
        await instructeur.save();
      }

      cours.statutApprobation = 'PENDING';
      await cours.save();

      const coursPopulated = await Cours.findById(courseId).populate('domaineId', 'nom').lean();

      res.json({
        success: true,
        data: coursPopulated,
        message: 'Cours soumis pour approbation avec succès',
      });
    } catch (err) {
      next(err);
    }
  };

  static getCoursesInProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw createError(400, 'ID instructeur invalide');
      }

      const instructeur = await User.findById(id)
        .populate<{ coursEnCoursEdition: CourseDocument[] }>({
          path: 'coursEnCoursEdition',
          select: 'titre niveau domaineId description duree createdAt contenu',
          populate: { path: 'domaineId', select: 'nom' },
        })
        .lean<UserDocument>();

      if (!instructeur || instructeur.role !== RoleUtilisateur.ENSEIGNANT) {
        throw createError(404, 'Instructeur non trouvé');
      }

      res.json({
        success: true,
        data: instructeur.coursEnCoursEdition || [],
        message: 'Cours en cours récupérés avec succès',
      });
    } catch (err) {
      next(err);
    }
  };

  static getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw createError(400, 'ID instructeur invalide');
      }

      const instructeur = await User.findById(id)
        .populate([
          { path: 'coursCrees', select: 'titre niveau domaineId statutApprobation estPublie duree contenu', populate: { path: 'domaineId', select: 'nom' } },
          { path: 'coursEnCoursEdition', select: 'titre niveau domaineId description duree contenu', populate: { path: 'domaineId', select: 'nom' } },
        ])
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

export const getDomaines = InstructeurController.getDomaines;
export const getCourses = InstructeurController.getCourses;
export const createCourse = InstructeurController.createCourse;
export const updateCourse = InstructeurController.updateCourse;
export const submitForApproval = InstructeurController.submitForApproval;
export const getCoursesInProgress = InstructeurController.getCoursesInProgress;
export const getProfile = InstructeurController.getProfile;