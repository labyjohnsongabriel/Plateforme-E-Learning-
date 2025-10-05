import { Request, Response, NextFunction } from 'express';
import { CourseData } from '../../types';
declare class CoursController {
    static create: (req: Request<{}, {}, CourseData>, res: Response, next: NextFunction) => Promise<void>;
    static getAll: (req: Request<{}, {}, {}, {
        page?: string;
        limit?: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    static getById: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    static update: (req: Request<{
        id: string;
    }, {}, Partial<CourseData>>, res: Response, next: NextFunction) => Promise<void>;
    static delete: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
}
export default CoursController;
//# sourceMappingURL=CoursController.d.ts.map