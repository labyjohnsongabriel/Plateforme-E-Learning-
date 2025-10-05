import { Request, Response, NextFunction } from 'express';
declare class ContenuController {
    static create: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    static getAll: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    static getById: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    static update: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    static delete: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
}
export default ContenuController;
//# sourceMappingURL=ContenuController.d.ts.map