import { Types } from 'mongoose';
import { IInscription } from '../../models/learning/Inscription';
export declare enum StatutInscription {
    EN_COURS = "EN_COURS",
    COMPLETE = "COMPLETE"
}
export declare const enroll: (apprenantId: string | Types.ObjectId, coursId: string | Types.ObjectId) => Promise<IInscription>;
export declare const getUserEnrollments: (apprenantId: string | Types.ObjectId) => Promise<IInscription[]>;
export declare const updateStatus: (inscriptionId: string | Types.ObjectId, newStatus: StatutInscription, apprenantId: string | Types.ObjectId) => Promise<IInscription>;
export declare const deleteEnrollment: (inscriptionId: string | Types.ObjectId, apprenantId: string | Types.ObjectId) => Promise<{
    message: string;
}>;
//# sourceMappingURL=InscriptionService.d.ts.map