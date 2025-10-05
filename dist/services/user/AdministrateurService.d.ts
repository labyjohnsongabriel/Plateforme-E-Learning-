import { Types } from 'mongoose';
import { IUser, RoleUtilisateur } from '../../models/user/User';
import { ICours } from '../../models/course/Cours';
interface GlobalStats {
    usersCount: number;
    adminsCount: number;
    coursesCount: number;
    completionsCount: number;
    certificatesCount: number;
    enrollmentsCount: number;
    coursesByDomain: Record<string, number>;
    completionsByLevel: Record<string, number>;
}
interface UserStats {
    user: {
        nom: string;
        prenom: string;
        role: RoleUtilisateur;
    };
    enrollments: number;
    progressions: number;
    completions: number;
    certificates: number;
    averageProgress: number;
}
interface CourseStats {
    cours: {
        titre: string;
        niveau: string;
        domaine: string;
    };
    enrollments: number;
    completions: number;
    certificates: number;
}
export declare const getAllUsers: () => Promise<Partial<IUser>[]>;
export declare const updateUser: (userId: string | Types.ObjectId, data: Partial<IUser>) => Promise<IUser | null>;
export declare const deleteUser: (userId: string | Types.ObjectId) => Promise<void>;
export declare const getGlobalStats: () => Promise<GlobalStats>;
export declare const getUserStats: (userId: string | Types.ObjectId) => Promise<UserStats>;
export declare const getCourseStats: (coursId: string | Types.ObjectId) => Promise<CourseStats>;
export declare const getRecentUsers: (limit?: number) => Promise<Partial<IUser>[]>;
export declare const getCompletionRate: () => Promise<{
    rate: number;
}>;
export declare const createCourse: (data: CourseData) => Promise<ICours>;
export declare const updateCourse: (coursId: string | Types.ObjectId, data: CourseData) => Promise<ICours | null>;
export declare const deleteCourse: (coursId: string | Types.ObjectId) => Promise<void>;
export {};
//# sourceMappingURL=AdministrateurService.d.ts.map