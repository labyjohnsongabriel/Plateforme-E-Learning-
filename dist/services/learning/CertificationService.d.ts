import { ICertificat } from '../../models/learning/Certificat';
import { IProgression } from '../../models/learning/Progression';
export declare enum NiveauFormation {
    ALFA = "ALFA",
    BETA = "BETA",
    GAMMA = "GAMMA",
    DELTA = "DELTA"
}
export declare const generateIfEligible: (progression: IProgression) => Promise<ICertificat | null>;
//# sourceMappingURL=CertificationService.d.ts.map