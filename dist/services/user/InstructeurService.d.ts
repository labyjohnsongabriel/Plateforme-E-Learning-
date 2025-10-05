import { Types } from 'mongoose';
import { ICours } from '../../models/course/Cours';
interface CourseData {
    [key: string]: any;
}
export declare const getInstructeurCourses: (instructeurId: string | Types.ObjectId) => Promise<ICours[]>;
export declare const createInstructeurCourse: (instructeurId: string | Types.ObjectId, data: CourseData) => Promise<ICours>;
export declare const updateInstructeurCourse: (instructeurId: string | Types.ObjectId, coursId: string | Types.ObjectId, data: CourseData) => Promise<ICours | null>;
export declare const submitCourseForApproval: (instructeurId: string | Types.ObjectId, coursId: string | Types.ObjectId) => Promise<ICours | null>;
export declare const getInstructeurCoursesInProgress: (instructeurId: string | Types.ObjectId) => Promise<ICours[]>;
export {};
//# sourceMappingURL=InstructeurService.d.ts.map