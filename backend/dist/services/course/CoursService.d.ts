import { Types } from 'mongoose';
import { ICours } from '../../models/learning/Cours';
interface CoursData {
    [key: string]: any;
}
export declare const createCourse: (data: CoursData, createurId: string | Types.ObjectId) => Promise<ICours>;
export declare const getAllCourses: () => Promise<ICours[]>;
export declare const updateCourse: (coursId: string | Types.ObjectId, data: Partial<CoursData>) => Promise<ICours | null>;
export declare const deleteCourse: (coursId: string | Types.ObjectId) => Promise<void>;
export {};
//# sourceMappingURL=CoursService.d.ts.map