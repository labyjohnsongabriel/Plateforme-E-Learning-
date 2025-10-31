// src/services/learning/CoursService.ts
import { Types, FlattenMaps } from 'mongoose';
import createError from 'http-errors';
import Cours, { ICours, IContenu } from '../../models/course/Cours';
import { NiveauFormation } from '../learning/CertificationService';
import Progression from '../../models/learning/Progression';

// ──────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────
export interface CourseCreateData {
  titre: string;
  description?: string;
  duree: number;
  domaineId: string | Types.ObjectId;
  niveau: string;
  contenu?: IContenu | null;
  quizzes?: (string | Types.ObjectId)[];
  estPublie?: boolean;
  statutApprobation?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface CourseUpdateData {
  titre?: string;
  description?: string;
  duree?: number;
  domaineId?: string | Types.ObjectId;
  niveau?: string;
  contenu?: IContenu | null;
  quizzes?: (string | Types.ObjectId)[];
  estPublie?: boolean;
  statutApprobation?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

// Document retourné après lean()
export type CourseDocument = FlattenMaps<ICours & { _id: Types.ObjectId }> & {
  __v?: number;
};

// ──────────────────────────────────────────────────
// SERVICE
// ──────────────────────────────────────────────────
export class CoursService {
  private static validateContenu(contenu: any): contenu is IContenu {
    return (
      contenu &&
      Array.isArray(contenu.sections) &&
      contenu.sections.every((s: any) =>
        typeof s.titre === 'string' &&
        typeof s.ordre === 'number' &&
        Array.isArray(s.modules) &&
        s.modules.every((m: any) =>
          typeof m.titre === 'string' &&
          ['VIDEO', 'TEXTE', 'QUIZ'].includes(m.type) &&
          typeof m.contenu === 'string' &&
          typeof m.duree === 'number' &&
          typeof m.ordre === 'number'
        )
      )
    );
  }

  static async createCourse(data: CourseCreateData, createurId: string): Promise<CourseDocument> {
    try {
      if (!data.titre || !data.duree || !data.domaineId || !data.niveau) {
        throw createError(400, 'Champs requis manquants');
      }

      if (!Object.values(NiveauFormation).includes(data.niveau as NiveauFormation)) {
        throw createError(400, `Niveau invalide`);
      }

      if (!Types.ObjectId.isValid(data.domaineId) || !Types.ObjectId.isValid(createurId)) {
        throw createError(400, 'ID invalide');
      }

      let parsedContenu: IContenu | null = { sections: [] };
      if (data.contenu !== undefined) {
        if (data.contenu === null) {
          parsedContenu = null;
        } else if (this.validateContenu(data.contenu)) {
          parsedContenu = { sections: data.contenu.sections };
        } else {
          throw createError(400, 'Structure contenu invalide');
        }
      }

      const course = new Cours({
        titre: data.titre.trim(),
        description: data.description?.trim() ?? '',
        duree: data.duree,
        domaineId: new Types.ObjectId(data.domaineId),
        niveau: data.niveau as NiveauFormation,
        createur: new Types.ObjectId(createurId),
        contenu: parsedContenu,
        quizzes: data.quizzes?.map(id => typeof id === 'string' ? new Types.ObjectId(id) : id) ?? [],
        estPublie: data.estPublie ?? false,
        statutApprobation: data.statutApprobation ?? 'PENDING',
      });

      const saved = await course.save();

      const populated = await Cours.findById(saved._id)
        .populate([
          { path: 'domaineId', select: 'nom' },
          { path: 'createur', select: 'id prenom nom email role' },
          { path: 'quizzes' },
        ])
        .lean();

      if (!populated) throw createError(500, 'Erreur post-création');

      return populated as unknown as CourseDocument;
    } catch (err) {
      if (err instanceof createError.HttpError) throw err;
      throw createError(500, `Création échouée: ${(err as Error).message}`);
    }
  }

  static async getCourseById(coursId: string): Promise<CourseDocument> {
    try {
      if (!Types.ObjectId.isValid(coursId)) throw createError(400, 'ID invalide');

      const course = await Cours.findById(coursId)
        .populate([
          { path: 'createur', select: 'id prenom nom email role' },
          { path: 'domaineId', select: 'nom' },
          { path: 'quizzes' },
        ])
        .lean();

      if (!course) throw createError(404, 'Cours non trouvé');

      return course as unknown as CourseDocument;
    } catch (err) {
      if (err instanceof createError.HttpError) throw err;
      throw createError(500, `Récupération échouée: ${(err as Error).message}`);
    }
  }

  static async getAllCourses(): Promise<CourseDocument[]> {
    try {
      const courses = await Cours.find({})
        .populate([
          { path: 'createur', select: 'id prenom nom email role' },
          { path: 'domaineId', select: 'nom' },
          { path: 'quizzes' },
        ])
        .lean();

      return courses as unknown as CourseDocument[];
    } catch (err) {
      throw createError(500, `Liste échouée: ${(err as Error).message}`);
    }
  }

  static async updateCourse(coursId: string, data: CourseUpdateData, createurId?: string): Promise<CourseDocument> {
    try {
      if (!Types.ObjectId.isValid(coursId)) throw createError(400, 'ID invalide');

      const course = await Cours.findById(coursId);
      if (!course) throw createError(404, 'Cours non trouvé');
      if (createurId && course.createur.toString() !== createurId) {
        throw createError(403, 'Accès refusé');
      }

      if (data.titre !== undefined) course.titre = data.titre.trim();
      if (data.description !== undefined) course.description = data.description.trim();
      if (data.duree !== undefined) course.duree = data.duree;

      if (data.domaineId !== undefined) {
        if (!Types.ObjectId.isValid(data.domaineId)) throw createError(400, 'domaineId invalide');
        course.domaineId = new Types.ObjectId(data.domaineId);
      }

      if (data.niveau !== undefined) {
        if (!Object.values(NiveauFormation).includes(data.niveau as NiveauFormation)) {
          throw createError(400, 'Niveau invalide');
        }
        course.niveau = data.niveau as NiveauFormation;
      }

      // ICI : null autorisé
      if (data.contenu !== undefined) {
        if (data.contenu === null) {
          course.contenu = null;
        } else if (this.validateContenu(data.contenu)) {
          course.contenu = { sections: data.contenu.sections };
        } else {
          throw createError(400, 'Contenu invalide');
        }
      }

      if (data.quizzes !== undefined) {
        course.quizzes = data.quizzes.map(id => typeof id === 'string' ? new Types.ObjectId(id) : id);
      }

      if (data.estPublie !== undefined) course.estPublie = data.estPublie;
      if (data.statutApprobation !== undefined) course.statutApprobation = data.statutApprobation;

      const updated = await course.save();

      const populated = await Cours.findById(updated._id)
        .populate([
          { path: 'domaineId', select: 'nom' },
          { path: 'createur', select: 'id prenom nom email role' },
          { path: 'quizzes' },
        ])
        .lean();

      if (!populated) throw createError(500, 'Erreur post-update');

      return populated as unknown as CourseDocument;
    } catch (err) {
      if (err instanceof createError.HttpError) throw err;
      throw createError(500, `Mise à jour échouée: ${(err as Error).message}`);
    }
  }

  static async deleteCourse(coursId: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(coursId)) throw createError(400, 'ID invalide');
      const course = await Cours.findByIdAndDelete(coursId);
      if (!course) throw createError(404, 'Cours non trouvé');
    } catch (err) {
      if (err instanceof createError.HttpError) throw err;
      throw createError(500, `Suppression échouée: ${(err as Error).message}`);
    }
  }

  static async publishCourse(coursId: string, createurId: string): Promise<CourseDocument> {
    try {
      if (!Types.ObjectId.isValid(coursId) || !Types.ObjectId.isValid(createurId)) {
        throw createError(400, 'ID invalide');
      }

      const course = await Cours.findById(coursId);
      if (!course) throw createError(404, 'Cours non trouvé');
      if (course.createur.toString() !== createurId) throw createError(403, 'Accès refusé');

      course.estPublie = true;
      course.datePublication = new Date();
      course.statutApprobation = 'APPROVED';

      const updated = await course.save();

      const populated = await Cours.findById(updated._id)
        .populate([
          { path: 'domaineId', select: 'nom' },
          { path: 'createur', select: 'id prenom nom email role' },
          { path: 'quizzes' },
        ])
        .lean();

      if (!populated) throw createError(500, 'Erreur publication');

      return populated as unknown as CourseDocument;
    } catch (err) {
      if (err instanceof createError.HttpError) throw err;
      throw createError(500, `Publication échouée: ${(err as Error).message}`);
    }
  }

  static async getCompletionRate(coursId: string): Promise<number> {
    try {
      if (!Types.ObjectId.isValid(coursId)) throw createError(400, 'ID invalide');

      const result = await Progression.aggregate([
        { $match: { cours: new Types.ObjectId(coursId) } },
        { $group: { _id: null, moyenne: { $avg: '$pourcentage' } } },
      ]);

      return result[0]?.moyenne ? Math.round(result[0].moyenne) : 0;
    } catch (err) {
      throw createError(500, `Calcul complétion échoué: ${(err as Error).message}`);
    }
  }
}