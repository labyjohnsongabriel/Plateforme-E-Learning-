import { Request, Response, NextFunction } from 'express';
/**
 * @desc Validation pour l'inscription
 */
export declare const register: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
/**
 * @desc Validation pour la connexion
 */
export declare const login: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
//# sourceMappingURL=authValidator.d.ts.map