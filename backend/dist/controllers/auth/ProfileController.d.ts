import { Request, Response, NextFunction } from 'express';
interface UpdateProfileRequestBody {
    [key: string]: any;
}
declare class ProfileController {
    static getProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    static updateProfile: (req: Request<{}, {}, UpdateProfileRequestBody>, res: Response, next: NextFunction) => Promise<void>;
}
export default ProfileController;
//# sourceMappingURL=ProfileController.d.ts.map