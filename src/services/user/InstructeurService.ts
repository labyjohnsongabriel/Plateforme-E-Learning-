import { Types } from 'mongoose';
import createError from 'http-errors';
import User, { IUser } from '../../models/user/User';
import * as CoursService from '../../services/learning/CoursService';
import { ICours } from '../../models/course/Cours';

// Interface for course creation/update data
interface CourseData {
  [key: string]: any; // Flexible to accommodate various fields
}

// Get instructor's created courses
export const getInstructeurCourses = async (instructeurId: string | Types.ObjectId): Promise<ICours[]> => {
  const instructeur = await User.findById(instructeurId).populate('coursCrees');
  if (!instructeur) {
    throw createError(404, 'Instructeur non trouvé');
  }
  return instructeur.coursCrees || [];
};

// Create a course for instructor
export const createInstructeurCourse = async (instructeurId: string | Types.ObjectId, data: CourseData): Promise<ICours> => {
  const cours = await CoursService.createCourse(data, instructeurId);
  const instructeur = await User.findById(instructeurId);
  if (!instructeur) {
    throw createError(404, 'Instructeur non trouvé');
  }
  instructeur.coursEnCoursEdition.push(cours._id);
  await instructeur.save();
  return cours;
};

// Update an instructor's course
export const updateInstructeurCourse = async (
  instructeurId: string | Types.ObjectId,
  coursId: string | Types.ObjectId,
  data: CourseData
): Promise<ICours | null> => {
  const instructeur = await User.findById(instructeurId);
  if (!instructeur) {
    throw createError(404, 'Instructeur non trouvé');
  }
  if (!instructeur.coursCrees.includes(coursId) && !instructeur.coursEnCoursEdition.includes(coursId)) {
    throw createError(403, 'Non autorisé à modifier ce cours');
  }
  return await CoursService.updateCourse(coursId, data);
};

// Submit a course for approval
export const submitCourseForApproval = async (
  instructeurId: string | Types.ObjectId,
  coursId: string | Types.ObjectId
): Promise<ICours | null> => {
  const instructeur = await User.findById(instructeurId);
  if (!instructeur) {
    throw createError(404, 'Instructeur non trouvé');
  }
  const courseIndex = instructeur.coursEnCoursEdition.indexOf(coursId);
  if (courseIndex === -1) {
    throw createError(400, 'Cours non en cours d\'édition');
  }
  instructeur.coursEnCoursEdition.splice(courseIndex, 1);
  instructeur.coursCrees.push(coursId);
  await instructeur.save();
  return await CoursService.updateCourse(coursId, { statutApprobation: 'PENDING' });
};

// Get instructor's courses in progress
export const getInstructeurCoursesInProgress = async (instructeurId: string | Types.ObjectId): Promise<ICours[]> => {
  const instructeur = await User.findById(instructeurId).populate('coursEnCoursEdition');
  if (!instructeur) {
    throw createError(404, 'Instructeur non trouvé');
  }
  return instructeur.coursEnCoursEdition || [];
};