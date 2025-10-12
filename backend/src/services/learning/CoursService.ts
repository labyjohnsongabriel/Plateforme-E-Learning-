// src/services/learning/CoursService.ts
import { Types, model } from 'mongoose';
import createError from 'http-errors';
import { CourseDocument, CourseCreateData, CourseUpdateData } from '../../types';
import Cours from '../../models/course/Cours';
import { NiveauFormation } from './CertificationService';

export class CoursService {
  /**
   * Crée un nouveau cours.
   * @param data - Données du cours à créer
   * @param createurId - ID de l'utilisateur créateur
   */
  static async createCourse(data: CourseCreateData, createurId: string): Promise<CourseDocument> {
    try {
      if (!data.titre || !data.duree || !data.domaineId || !data.niveau) {
        throw createError(400, 'Les champs titre, duree, domaineId et niveau sont requis');
      }

      // Validation du niveau
      if (!Object.values(NiveauFormation).includes(data.niveau as NiveauFormation)) {
        throw createError(400, `Niveau invalide. Valeurs acceptées: ${Object.values(NiveauFormation).join(', ')}`);
      }

      // Validation des ObjectId
      if (!Types.ObjectId.isValid(data.domaineId)) {
        throw createError(400, 'domaineId invalide');
      }
      if (!Types.ObjectId.isValid(createurId)) {
        throw createError(400, 'createurId invalide');
      }

      const course = new Cours({
        titre: data.titre,
        description: data.description ?? '',
        duree: data.duree,
        domaineId: data.domaineId,
        niveau: data.niveau as NiveauFormation,
        createur: createurId,
        contenu: data.contenu ?? [],
        quizzes: data.quizzes ?? [],
        estPublie: data.estPublie ?? false,
        statutApprobation: data.statutApprobation ?? 'PENDING',
        createdAt: new Date(),
      });

      return await course.save().then(doc => doc.populate([
        { path: 'domaineId', select: 'nom' },
        { path: 'createur', select: 'id role' },
        { path: 'contenu' },
        { path: 'quizzes' }
      ]));
    } catch (err) {
      throw createError(500, `Erreur lors de la création du cours: ${(err as Error).message}`);
    }
  }

  /**
   * Récupère un cours par son ID.
   * @param coursId - ID du cours
   */
  static async getCourseById(coursId: string): Promise<CourseDocument> {
    try {
      if (!Types.ObjectId.isValid(coursId)) {
        throw createError(400, 'ID de cours invalide');
      }
      const course = await Cours.findById(coursId).populate([
        { path: 'createur', select: 'id role' },
        { path: 'domaineId', select: 'nom' },
        { path: 'contenu' },
        { path: 'quizzes' }
      ]);
      if (!course) {
        throw createError(404, 'Cours non trouvé');
      }
      return course;
    } catch (err) {
      throw createError(500, `Erreur lors de la récupération du cours: ${(err as Error).message}`);
    }
  }

  /**
   * Récupère tous les cours.
   */
  static async getAllCourses(): Promise<CourseDocument[]> {
    try {
      return await Cours.find({}).populate([
        { path: 'createur', select: 'id role' },
        { path: 'domaineId', select: 'nom' },
        { path: 'contenu' },
        { path: 'quizzes' }
      ]);
    } catch (err) {
      throw createError(500, `Erreur lors de la récupération des cours: ${(err as Error).message}`);
    }
  }

  /**
   * Met à jour un cours existant.
   * @param coursId - ID du cours à mettre à jour
   * @param data - Données à mettre à jour
   * @param createurId - ID de l'utilisateur (optionnel, pour vérifier l'autorisation)
   */
  static async updateCourse(coursId: string, data: CourseUpdateData, createurId?: string): Promise<CourseDocument> {
    try {
      if (!Types.ObjectId.isValid(coursId)) {
        throw createError(400, 'ID de cours invalide');
      }
      const course = await Cours.findById(coursId);
      if (!course) throw createError(404, 'Cours non trouvé');
      if (createurId && course.createur.toString() !== createurId) {
        throw createError(403, 'Non autorisé à modifier ce cours');
      }

      if (data.titre !== undefined) course.titre = data.titre;
      if (data.description !== undefined) course.description = data.description;
      if (data.duree !== undefined) course.duree = data.duree;
      if (data.domaineId !== undefined) {
        if (!Types.ObjectId.isValid(data.domaineId)) {
          throw createError(400, 'domaineId invalide');
        }
        course.domaineId = data.domaineId;
      }
      if (data.niveau !== undefined) {
        if (!Object.values(NiveauFormation).includes(data.niveau as NiveauFormation)) {
          throw createError(400, `Niveau invalide. Valeurs acceptées: ${Object.values(NiveauFormation).join(', ')}`);
        }
        course.niveau = data.niveau as NiveauFormation;
      }
      if (data.contenu !== undefined) course.contenu = data.contenu;
      if (data.quizzes !== undefined) course.quizzes = data.quizzes;
      if (data.estPublie !== undefined) course.estPublie = data.estPublie;
      if (data.statutApprobation !== undefined) course.statutApprobation = data.statutApprobation;

      return await course.save().then(doc => doc.populate([
        { path: 'domaineId', select: 'nom' },
        { path: 'createur', select: 'id role' },
        { path: 'contenu' },
        { path: 'quizzes' }
      ]));
    } catch (err) {
      throw createError(500, `Erreur lors de la mise à jour du cours: ${(err as Error).message}`);
    }
  }

  /**
   * Supprime un cours.
   * @param coursId - ID du cours
   */
  static async deleteCourse(coursId: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(coursId)) {
        throw createError(400, 'ID de cours invalide');
      }
      const course = await Cours.findByIdAndDelete(coursId);
      if (!course) throw createError(404, 'Cours non trouvé');
    } catch (err) {
      throw createError(500, `Erreur lors de la suppression du cours: ${(err as Error).message}`);
    }
  }

  /**
   * Ajoute un contenu à un cours.
   * @param coursId - ID du cours
   * @param contenuId - ID du contenu
   * @param createurId - ID de l'utilisateur
   */
  static async addContenu(coursId: string, contenuId: Types.ObjectId, createurId: string): Promise<CourseDocument> {
    try {
      if (!Types.ObjectId.isValid(coursId) || !Types.ObjectId.isValid(contenuId) || !Types.ObjectId.isValid(createurId)) {
        throw createError(400, 'ID invalide');
      }
      const course = await Cours.findById(coursId);
      if (!course) throw createError(404, 'Cours non trouvé');
      if (course.createur.toString() !== createurId) throw createError(403, 'Non autorisé à modifier ce cours');

      course.contenu = course.contenu ?? [];
      if (!course.contenu.includes(contenuId)) {
        course.contenu.push(contenuId);
      }
      return await course.save().then(doc => doc.populate([
        { path: 'domaineId', select: 'nom' },
        { path: 'createur', select: 'id role' },
        { path: 'contenu' },
        { path: 'quizzes' }
      ]));
    } catch (err) {
      throw createError(500, `Erreur lors de l'ajout du contenu: ${(err as Error).message}`);
    }
  }

  /**
   * Publie un cours.
   * @param coursId - ID du cours
   * @param createurId - ID de l'utilisateur
   */
  static async publishCourse(coursId: string, createurId: string): Promise<CourseDocument> {
    try {
      if (!Types.ObjectId.isValid(coursId) || !Types.ObjectId.isValid(createurId)) {
        throw createError(400, 'ID invalide');
      }
      const course = await Cours.findById(coursId);
      if (!course) throw createError(404, 'Cours non trouvé');
      if (course.createur.toString() !== createurId) throw createError(403, 'Non autorisé à publier ce cours');

      course.estPublie = true;
      course.datePublication = new Date();
      return await course.save().then(doc => doc.populate([
        { path: 'domaineId', select: 'nom' },
        { path: 'createur', select: 'id role' },
        { path: 'contenu' },
        { path: 'quizzes' }
      ]));
    } catch (err) {
      throw createError(500, `Erreur lors de la publication du cours: ${(err as Error).message}`);
    }
  }

  /**
   * Calcule la complétion moyenne d'un cours.
   * @param coursId - ID du cours
   */
  static async getCompletionRate(coursId: string): Promise<number> {
    try {
      if (!Types.ObjectId.isValid(coursId)) {
        throw createError(400, 'ID de cours invalide');
      }
      const course = await Cours.findById(coursId);
      if (!course) throw createError(404, 'Cours non trouvé');

      // Utilisation de l'aggregation pour calculer la moyenne
      const Progression = model('Progression');
      const result = await Progression.aggregate([
        { $match: { cours: new Types.ObjectId(coursId) } },
        { $group: { _id: null, moyenne: { $avg: '$pourcentage' } } },
      ]);
      return result.length > 0 ? result[0].moyenne || 0 : 0;
    } catch (err) {
      throw createError(500, `Erreur lors du calcul de la complétion: ${(err as Error).message}`);
    }
  }
}