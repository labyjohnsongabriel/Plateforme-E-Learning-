import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
export declare const enroll: ((<TOpts extends Joi.AsyncValidationOptions>(value: any, options?: TOpts | undefined) => Promise<TOpts extends {
    artifacts: true;
} | {
    warnings: true;
} ? {
    value: any;
} & (TOpts extends {
    artifacts: true;
} ? {
    artifacts: Map<any, string[][]>;
} : {}) & (TOpts extends {
    warnings: true;
} ? {
    warning: Joi.ValidationWarning;
} : {}) : any>) | ((req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>))[];
export declare const updateProgress: ((<TOpts extends Joi.AsyncValidationOptions>(value: any, options?: TOpts | undefined) => Promise<TOpts extends {
    artifacts: true;
} | {
    warnings: true;
} ? {
    value: any;
} & (TOpts extends {
    artifacts: true;
} ? {
    artifacts: Map<any, string[][]>;
} : {}) & (TOpts extends {
    warnings: true;
} ? {
    warning: Joi.ValidationWarning;
} : {}) : any>) | ((req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>))[];
export declare const updateStatus: ((<TOpts extends Joi.AsyncValidationOptions>(value: any, options?: TOpts | undefined) => Promise<TOpts extends {
    artifacts: true;
} | {
    warnings: true;
} ? {
    value: any;
} & (TOpts extends {
    artifacts: true;
} ? {
    artifacts: Map<any, string[][]>;
} : {}) & (TOpts extends {
    warnings: true;
} ? {
    warning: Joi.ValidationWarning;
} : {}) : any>) | ((req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>))[];
//# sourceMappingURL=learningValidator.d.ts.map