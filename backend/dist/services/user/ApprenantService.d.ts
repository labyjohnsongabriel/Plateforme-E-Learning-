import { Types } from 'mongoose';
import { ICertificat } from '../../models/learning/Certificat';
import { IProgression } from '../../models/learning/Progression';
export declare const getApprenantProgress: (apprenantId: string | Types.ObjectId) => Promise<IProgression[]>;
export declare const getApprenantCertificates: (apprenantId: string | Types.ObjectId) => Promise<ICertificat[]>;
export declare const enrollApprenant: (apprenantId: string | Types.ObjectId, coursId: string | Types.ObjectId) => Promise<any>;
export declare const updateApprenantProgress: (apprenantId: string | Types.ObjectId, coursId: string | Types.ObjectId, pourcentage: number) => Promise<any>;
//# sourceMappingURL=ApprenantService.d.ts.map