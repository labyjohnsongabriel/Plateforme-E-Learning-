import { Request, Response, NextFunction } from 'express';
import { QuizData, ReponseData } from '../../types';
declare class QuizController {
    static create: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    static getAll: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    static getById: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    static update: (req: Request<{
        id: string;
    }, {}, Partial<QuizData>>, res: Response, next: NextFunction) => Promise<void>;
    static delete: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    static soumettre: (req: Request<{
        id: string;
    }, {}, {
        reponses: ReponseData;
    }>, res: Response, next: NextFunction) => Promise<void>;
}
export default QuizController;
//# sourceMappingURL=QuizController.d.ts.map