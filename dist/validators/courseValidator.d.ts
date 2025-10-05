import { Request, Response, NextFunction } from 'express';
/**
 * @desc Validation for creating a course
 */
export declare const create: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
/**
 * @desc Validation for updating a course
 */
export declare const update: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
/**
 * @desc Validation for creating course content
 */
export declare const createContenu: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
/**
 * @desc Validation for updating course content
 */
export declare const updateContenu: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
/**
 * @desc Validation for creating a quiz
 */
export declare const createQuiz: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
/**
 * @desc Validation for updating a quiz
 */
export declare const updateQuiz: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
/**
 * @desc Validation for submitting a quiz
 */
export declare const submitQuiz: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
/**
 * @desc Validation for creating a domain
 */
export declare const createDomaine: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
/**
 * @desc Validation for updating a domain
 */
export declare const updateDomaine: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
//# sourceMappingURL=courseValidator.d.ts.map