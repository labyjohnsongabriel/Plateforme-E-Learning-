import { Request, Response, NextFunction } from 'express';
import { StatutInscription } from '../../services/learning/InscriptionService';
import { InscriptionData } from '../../types';
declare class InscriptionController {
    static enroll: (req: Request<{}, {}, InscriptionData>, res: Response, next: NextFunction) => Promise<void>;
    static getUserEnrollments: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    static updateStatus: (req: Request<{
        id: string;
    }, {}, {
        statut: StatutInscription;
    }>, res: Response, next: NextFunction) => Promise<void>;
    static delete: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
}
export default InscriptionController;
//# sourceMappingURL=InscriptionController.d.ts.map