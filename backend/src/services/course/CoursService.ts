// src/services/learning/CoursService.ts (nouveau service pour corriger les problèmes d'affichage et de population)
import Cours, { ICours } from '../../models/course/Cours';
import createError from 'http-errors';
import { CourseCreateData, CourseUpdateData } from '../../types';
import { NiveauFormation } from '../../services/learning/CertificationService';

export const createCourse = async (data: CourseCreateData, userId: string): Promise<ICours> => {
  const { titre, description, duree, domaineId, niveau, contenu, quizzes, estPublie, statutApprobation } = data;

  if (!titre || !duree || !domaineId || !niveau) {
    throw createError(400, 'Les champs titre, duree, domaineId et niveau sont requis');
  }

  const course = new Cours({
    titre,
    description: description ?? '',
    duree,
    domaineId,
    niveau,
    contenu: contenu ?? [],
    quizzes: quizzes ?? [],
    estPublie: estPublie ?? false,
    statutApprobation: statutApprobation ?? 'APPROVED',
    createur: userId,
  });

  await course.save();
  return course;
};

export const getAllCourses = async (): Promise<ICours[]> => {
  return await Cours.find().populate('domaineId');
};

export const getCourseById = async (id: string): Promise<ICours | null> => {
  const course = await Cours.findById(id).populate('domaineId');
  if (!course) {
    throw createError(404, 'Cours non trouvé');
  }
  return course;
};

export const updateCourse = async (id: string, data: CourseUpdateData): Promise<ICours | null> => {
  const course = await Cours.findByIdAndUpdate(id, data, { new: true }).populate('domaineId');
  if (!course) {
    throw createError(404, 'Cours non trouvé');
  }
  return course;
};

export const deleteCourse = async (id: string): Promise<void> => {
  const course = await Cours.findByIdAndDelete(id);
  if (!course) {
    throw createError(404, 'Cours non trouvé');
  }
};