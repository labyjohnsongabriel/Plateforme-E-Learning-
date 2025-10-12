import { Types } from 'mongoose';
import { IProgression } from '../../models/learning/Progression';
export declare enum StatutProgression {
    EN_COURS = "EN_COURS",
    COMPLETE = "COMPLETE"
}
export declare class ProgressionService {
    static initialize(apprenantId: string | Types.ObjectId, coursId: string | Types.ObjectId): Promise<IProgression>;
    static update(apprenantId: string | Types.ObjectId, coursId: string | Types.ObjectId, pourcentage: number): Promise<IProgression>;
    static getByUserAndCourse(apprenantId: string | Types.ObjectId, coursId: string | Types.ObjectId): Promise<IProgression>;
    static getUserProgressions(apprenantId: string | Types.ObjectId): Promise<IProgression[]>;
    static getAllProgressions(): Promise<IProgression[]>;
}
export default ProgressionService;
//# sourceMappingURL=ProgressionService.d.ts.map