import { Types } from 'mongoose';
import { IProgression } from '../../models/learning/Progression';
export declare enum StatutProgression {
    EN_COURS = "EN_COURS",
    COMPLETE = "COMPLETE"
}
export declare const initialize: (apprenantId: string | Types.ObjectId, coursId: string | Types.ObjectId) => Promise<IProgression>;
export declare const update: (apprenantId: string | Types.ObjectId, coursId: string | Types.ObjectId, pourcentage: number) => Promise<IProgression>;
export declare const getByUserAndCourse: (apprenantId: string | Types.ObjectId, coursId: string | Types.ObjectId) => Promise<IProgression>;
export declare const getUserProgressions: (apprenantId: string | Types.ObjectId) => Promise<IProgression[]>;
export declare const getAllProgressions: () => Promise<IProgression[]>;
//# sourceMappingURL=ProgressionService.d.ts.map