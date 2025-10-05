import { Request, Response, NextFunction } from 'express';
interface RegisterRequestBody {
    nom: string;
    prenom: string;
    email: string;
    password: string;
}
interface LoginRequestBody {
    email: string;
    password: string;
}
declare class AuthController {
    static register: (req: Request<{}, {}, RegisterRequestBody>, res: Response, next: NextFunction) => Promise<void>;
    static login: (req: Request<{}, {}, LoginRequestBody>, res: Response, next: NextFunction) => Promise<void>;
    static getMe: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export default AuthController;
//# sourceMappingURL=AuthController.d.ts.map