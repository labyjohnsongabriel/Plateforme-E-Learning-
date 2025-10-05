import { Types } from 'mongoose';
import Cours, { ICours } from '../../models/learning/Cours';

// Interface for course creation data
interface CoursData {
  [key: string]: any; // Flexible to accommodate various fields
}

// Create a new course
export const createCourse = async (data: CoursData, createurId: string | Types.ObjectId): Promise<ICours> => {
  const course = new Cours({ ...data, createur: createurId });
  await course.save();
  return course;
};

// Get all courses with creator details
export const getAllCourses = async (): Promise<ICours[]> => {
  return await Cours.find().populate('createur', 'nom prenom');
};

// Update a course
export const updateCourse = async (coursId: string | Types.ObjectId, data: Partial<CoursData>): Promise<ICours | null> => {
  return await Cours.findByIdAndUpdate(coursId, data, { new: true });
};

// Delete a course
export const deleteCourse = async (coursId: string | Types.ObjectId): Promise<void> => {
  await Cours.findByIdAndDelete(coursId);
  // TODO: Optionally delete associated progressions and certificates
};