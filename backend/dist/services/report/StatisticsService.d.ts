import { Types } from 'mongoose';
import { IUser, RoleUtilisateur } from '../../models/user/User';
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
export declare const getGlobalStats: () => Promise<GlobalStats>;
export declare const getUserStats: (userId: string | Types.ObjectId) => Promise<UserStats>;
export declare const getCourseStats: (coursId: string | Types.ObjectId) => Promise<CourseStats>;
export declare const getRecentUsers: (limit?: number) => Promise<Partial<IUser>[]>;
export declare const getCompletionRate: () => Promise<{
    rate: number;
}>;
export {};
//# sourceMappingURL=StatisticsService.d.ts.map