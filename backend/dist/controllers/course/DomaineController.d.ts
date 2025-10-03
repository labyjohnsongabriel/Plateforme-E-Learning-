import { Request, Response, NextFunction } from 'express';
import { DomaineData } from '../../types';
declare class DomaineController {
    static create: (req: Request<{}, {}, DomaineData>, res: Response, next: NextFunction) => Promise<void>;
    static getAll: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    static getById: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    static update: (req: Request<{
        id: string;
    }, {}, Partial<DomaineData>>, res: Response, next: NextFunction) => Promise<void>;
    static delete: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
}
export default DomaineController;
//# sourceMappingURL=DomaineController.d.ts.map