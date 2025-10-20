import { Types } from 'mongoose';
import createError from 'http-errors';
import Module, { IModule } from '../../models/course/Module';
import Cours from '../../models/course/Cours';
import logger from '../../utils/logger';

interface User {
  id: string;
  role: string;
}

interface ModuleData {
  titre: string;
  url: string;
  ordre: number;
  coursId: string;
  description?: string;
  duree?: number;
  type: 'VIDEO' | 'DOCUMENT' | 'QUIZ' | 'EXERCICE';
}

class ModuleService {
  static async create(data: ModuleData, user: User): Promise<IModule> {
    try {
      if (!data.titre || !data.url || !data.ordre || !data.coursId || !data.type) {
        throw createError(400, 'Champs requis manquants: titre, url, ordre, coursId, type');
      }

      if (!Types.ObjectId.isValid(data.coursId)) {
        throw createError(400, 'ID du cours invalide');
      }

      const course = await Cours.findById(data.coursId);
      if (!course) {
        throw createError(404, 'Cours non trouvé');
      }

      if (user.role !== 'ADMIN' && user.id.toString() !== course.createur?.toString()) {
        throw createError(403, 'Non autorisé à créer un module pour ce cours');
      }

      const module = new Module({
        titre: data.titre,
        url: data.url,
        description: data.description,
        duree: data.duree,
        ordre: data.ordre,
        cours: data.coursId,
        type: data.type,
      });

      await module.save();

      await Cours.findByIdAndUpdate(data.coursId, { $push: { contenu: module._id } });

      logger.info(`✅ Nouveau module créé: ${module._id}`);
      return module;
    } catch (err) {
      logger.error(`❌ Erreur lors de la création du module: ${(err as Error).message}`, {
        error: err,
        data,
        user,
      });
      if ((err as any).name === 'ValidationError') {
        throw createError(400, `Erreur de validation: ${(err as Error).message}`);
      }
      throw err;
    }
  }

  static async getById(id: string): Promise<IModule> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw createError(400, 'ID du module invalide');
      }

      const module = await Module.findById(id);
      if (!module) {
        throw createError(404, 'Module non trouvé');
      }

      logger.info(`✅ Module trouvé: ${id}`);
      return module;
    } catch (err) {
      logger.error(`❌ Erreur lors de la récupération du module: ${(err as Error).message}`, { id });
      throw err;
    }
  }

  static async getByCourseId(courseId: string): Promise<IModule[]> {
    try {
      if (!Types.ObjectId.isValid(courseId)) {
        throw createError(400, 'ID du cours invalide');
      }

      const course = await Cours.findById(courseId);
      if (!course) {
        throw createError(404, 'Cours non trouvé');
      }

      const modules = await Module.find({ cours: courseId }).sort({ ordre: 1 });

      logger.info(`✅ Modules récupérés pour le cours: ${courseId}`, { count: modules.length });
      return modules;
    } catch (err) {
      logger.error(`❌ Erreur lors de la récupération des modules: ${(err as Error).message}`, {
        courseId,
      });
      throw err;
    }
  }

  static async update(id: string, data: Partial<ModuleData>, user: User): Promise<IModule> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw createError(400, 'ID du module invalide');
      }

      const module = await Module.findById(id);
      if (!module) {
        throw createError(404, 'Module non trouvé');
      }

      const course = await Cours.findById(module.cours);
      if (!course) {
        throw createError(404, 'Cours associé non trouvé');
      }

      if (user.role !== 'ADMIN' && user.id.toString() !== course.createur?.toString()) {
        throw createError(403, 'Non autorisé à modifier ce module');
      }

      const updatedModule = await Module.findByIdAndUpdate(
        id,
        {
          $set: {
            titre: data.titre ?? module.titre,
            url: data.url ?? module.url,
            description: data.description ?? module.description,
            duree: data.duree ?? module.duree,
            ordre: data.ordre ?? module.ordre,
            type: data.type ?? module.type,
          },
        },
        { new: true, runValidators: true }
      );

      if (!updatedModule) {
        throw createError(404, 'Module non trouvé après mise à jour');
      }

      logger.info(`✅ Module mis à jour: ${id}`);
      return updatedModule;
    } catch (err) {
      logger.error(`❌ Erreur lors de la mise à jour du module: ${(err as Error).message}`, {
        id,
        data,
        user,
      });
      if ((err as any).name === 'ValidationError') {
        throw createError(400, `Erreur de validation: ${(err as Error).message}`);
      }
      throw err;
    }
  }

  static async delete(id: string, user: User): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw createError(400, 'ID du module invalide');
      }

      const module = await Module.findById(id);
      if (!module) {
        throw createError(404, 'Module non trouvé');
      }

      const course = await Cours.findById(module.cours);
      if (!course) {
        throw createError(404, 'Cours associé non trouvé');
      }

      if (user.role !== 'ADMIN' && user.id.toString() !== course.createur?.toString()) {
        throw createError(403, 'Non autorisé à supprimer ce module');
      }

      await Module.findByIdAndDelete(id);
      await Cours.findByIdAndUpdate(module.cours, { $pull: { contenu: id } });

      logger.info(`✅ Module supprimé: ${id}`);
    } catch (err) {
      logger.error(`❌ Erreur lors de la suppression du module: ${(err as Error).message}`, {
        id,
        user,
      });
      throw err;
    }
  }
}

export default ModuleService;