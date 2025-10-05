import { Types } from 'mongoose';
import createError from 'http-errors';
import { CourseDocument, CourseCreateData, CourseUpdateData, CourseData } from '../../types';
import Cours from '../../models/learning/Cours';

export class CoursService {
  /**
   * Crée un nouveau cours.
   * @param data - Données du cours à créer
   * @param createurId - ID de l'utilisateur créateur (instructeur ou admin)
   * @returns Le document du cours créé
   */
  static async createCourse(data: CourseCreateData, createurId: string): Promise<CourseDocument> {
    try {
      // Validation des champs requis
      if (!data.titre || !data.duree || !data.domaineId || !data.niveau) {
        throw createError(400, 'Les champs titre, duree, domaineId et niveau sont requis');
      }
      const course = new Cours({
        titre: data.titre,
        description: data.description ?? '',
        duree: data.duree,
        domaineId: data.domaineId,
        niveau: data.niveau,
        createur: createurId,
        contenus: data.contenus ?? [],
        quizzes: data.quizzes ?? [],
        estPublie: data.estPublie ?? false,
        datePublication: data.estPublie ? new Date() : undefined,
        statutApprobation: data.statutApprobation ?? 'PENDING',
        createdAt: new Date(),
      });
      return await course.save();
    } catch (err) {
      throw createError(500, `Erreur lors de la création du cours: ${(err as Error).message}`);
    }
  }

  /**
   * Met à jour un cours existant.
   * @param coursId - ID du cours à mettre à jour
   * @param data - Données à mettre à jour
   * @param createurId - ID de l'utilisateur (optionnel, pour vérifier l'autorisation)
   * @returns Le document du cours mis à jour
   */
  static async updateCourse(coursId: string, data: CourseUpdateData, createurId?: string): Promise<CourseDocument> {
    try {
      const course = await Cours.findById(coursId);
      if (!course) {
        throw createError(404, 'Cours non trouvé');
      }
      if (createurId && course.createur.toString() !== createurId) {
        throw createError(403, 'Non autorisé à modifier ce cours');
      }
      // Construire les données de mise à jour
      const updateData: Partial<CourseDocument> = {};
      if (data.titre !== undefined) updateData.titre = data.titre;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.duree !== undefined) updateData.duree = data.duree;
      if (data.domaineId !== undefined) updateData.domaineId = data.domaineId;
      if (data.niveau !== undefined) updateData.niveau = data.niveau;
      if (data.contenus !== undefined) updateData.contenus = data.contenus;
      if (data.quizzes !== undefined) updateData.quizzes = data.quizzes;
      if (data.estPublie !== undefined) updateData.estPublie = data.estPublie;
      if (data.datePublication !== undefined) updateData.datePublication = data.datePublication;
      if (data.statutApprobation !== undefined) updateData.statutApprobation = data.statutApprobation;

      Object.assign(course, updateData);
      return await course.save();
    } catch (err) {
      throw createError(500, `Erreur lors de la mise à jour du cours: ${(err as Error).message}`);
    }
  }

  /**
   * Récupère tous les cours.
   * @returns Liste de tous les documents de cours
   */
  static async getAllCourses(): Promise<CourseDocument[]> {
    try {
      return await Cours.find({})
        .populate('createur', 'id role')
        .populate('domaineId', 'nom')
        .populate('contenus quizzes');
    } catch (err) {
      throw createError(500, `Erreur lors de la récupération des cours: ${(err as Error).message}`);
    }
  }

  /**
   * Supprime un cours.
   * @param coursId - ID du cours à supprimer
   */
  static async deleteCourse(coursId: string): Promise<void> {
    try {
      const course = await Cours.findByIdAndDelete(coursId);
      if (!course) {
        throw createError(404, 'Cours non trouvé');
      }
    } catch (err) {
      throw createError(500, `Erreur lors de la suppression du cours: ${(err as Error).message}`);
    }
  }

  /**
   * Ajoute un contenu à un cours.
   * @param coursId - ID du cours
   * @param contenuId - ID du contenu à ajouter
   * @param createurId - ID de l'utilisateur (pour vérifier l'autorisation)
   * @returns Le document du cours mis à jour
   */
  static async addContenu(coursId: string, contenuId: Types.ObjectId, createurId: string): Promise<CourseDocument> {
    try {
      const course = await Cours.findById(coursId);
      if (!course) {
        throw createError(404, 'Cours non trouvé');
      }
      if (course.createur.toString() !== createurId) {
        throw createError(403, 'Non autorisé à modifier ce cours');
      }
      return await course.ajouterContenu(contenuId);
    } catch (err) {
      throw createError(500, `Erreur lors de l'ajout du contenu: ${(err as Error).message}`);
    }
  }

  /**
   * Publie un cours.
   * @param coursId - ID du cours à publier
   * @param createurId - ID de l'utilisateur (pour vérifier l'autorisation)
   * @returns Le document du cours publié
   */
  static async publishCourse(coursId: string, createurId: string): Promise<CourseDocument> {
    try {
      const course = await Cours.findById(coursId);
      if (!course) {
        throw createError(404, 'Cours non trouvé');
      }
      if (course.createur.toString() !== createurId) {
        throw createError(403, 'Non autorisé à publier ce cours');
      }
      return await course.publier();
    } catch (err) {
      throw createError(500, `Erreur lors de la publication du cours: ${(err as Error).message}`);
    }
  }

  /**
   * Calcule la complétion moyenne d'un cours.
   * @param coursId - ID du cours
   * @returns Pourcentage moyen de complétion
   */
  static async getCompletionRate(coursId: string): Promise<number> {
    try {
      const course = await Cours.findById(coursId);
      if (!course) {
        throw createError(404, 'Cours non trouvé');
      }
      return await course.calculerCompletionMoyenne();
    } catch (err) {
      throw createError(500, `Erreur lors du calcul de la complétion: ${(err as Error).message}`);
    }
  }
}