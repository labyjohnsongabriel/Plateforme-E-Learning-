import { Types } from 'mongoose';
import { IInscription } from '../../models/learning/Inscription';
export declare enum StatutInscription {
    EN_COURS = "EN_COURS",
    COMPLETE = "COMPLETE"
}
declare const InscriptionService: {
    enroll: (apprenantId: string | Types.ObjectId, coursId: string | Types.ObjectId) => Promise<IInscription>;
    getUserEnrollments: (apprenantId: string | Types.ObjectId) => Promise<IInscription[]>;
    updateStatus: (inscriptionId: string | Types.ObjectId, newStatus: StatutInscription, apprenantId: string | Types.ObjectId) => Promise<IInscription>;
    deleteEnrollment: (inscriptionId: string | Types.ObjectId, apprenantId: string | Types.ObjectId) => Promise<{
        message: string;
    }>;
};
export default InscriptionService;
//# sourceMappingURL=InscriptionService.d.ts.map