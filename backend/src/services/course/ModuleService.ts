import { Types } from 'mongoose';
import createError from 'http-errors';
import Module, { IModule } from '../../models/course/Module';
import Cours, { ICours } from '../../models/course/Cours';
import logger from '../../utils/logger';

export class ModuleService {
  static async getById(id: string): Promise<IModule> {
    if (!Types.ObjectId.isValid(id)) {
      throw createError(400, 'ID du module invalide');
    }

    const module = await Module.findById(id).populate('coursId', 'titre').exec();
    if (!module) {
      throw createError(404, 'Module non trouvé');
    }

    logger.info('Module fetched:', { moduleId: id, titre: module.titre });
    return module;
  }

  static async getByCourseId(courseId: string): Promise<IModule[]> {
    if (!Types.ObjectId.isValid(courseId)) {
      throw createError(400, 'ID du cours invalide');
    }

    const course = await Cours.findById(courseId).exec();
    if (!course) {
      throw createError(404, 'Cours non trouvé');
    }

    const modules = await Module.find({ coursId: courseId })
      .sort({ ordre: 1 })
      .exec();

    logger.info('Modules fetched for course:', { courseId, count: modules.length });
    return modules;
  }

  static async create(data: Partial<IModule>, userId: string): Promise<IModule> {
    if (!data.coursId || !Types.ObjectId.isValid(data.coursId)) {
      throw createError(400, 'ID du cours invalide');
    }

    const course = await Cours.findById(data.coursId).exec();
    if (!course) {
      throw createError(404, 'Cours non trouvé');
    }
    if (!course.instructeurId || course.instructeurId.toString() !== userId) {
      throw createError(403, 'Non autorisé à créer un module pour ce cours');
    }

    const module = new Module({
      ...data,
      dateCreation: new Date(),
    });
    await module.save();

    // Add module to course
    course.contenu = course.contenu || []; // Ensure contenu array exists
    //course.contenu.push(module._id);
    await course.save();

    logger.info('Module created:', { moduleId: module._id, titre: module.titre });
    return module;
  }

  static async update(id: string, data: Partial<IModule>, userId: string): Promise<IModule> {
    if (!Types.ObjectId.isValid(id)) {
      throw createError(400, 'ID du module invalide');
    }

    const module = await Module.findById(id).exec();
    if (!module) {
      throw createError(404, 'Module non trouvé');
    }

    const course = await Cours.findById(module.coursId).exec();
    if (!course || !course.instructeurId || course.instructeurId.toString() !== userId) {
      throw createError(403, 'Non autorisé à modifier ce module');
    }

    Object.assign(module, data);
    await module.save();
    logger.info('Module updated:', { moduleId: id });
    return module;
  }

  static async delete(id: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw createError(400, 'ID du module invalide');
    }

    const module = await Module.findById(id).exec();
    if (!module) {
      throw createError(404, 'Module non trouvé');
    }

    const course = await Cours.findById(module.coursId).exec();
    if (!course || !course.instructeurId || course.instructeurId.toString() !== userId) {
      throw createError(403, 'Non autorisé à supprimer ce module');
    }

    // Remove module from course
    course.contenu = course.contenu.filter((moduleId: Types.ObjectId) => moduleId.toString() !== id);
    await course.save();

    await module.deleteOne();
    logger.info('Module deleted:', { moduleId: id });
  }
}