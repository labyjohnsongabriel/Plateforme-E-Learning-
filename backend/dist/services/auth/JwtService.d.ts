import { RoleUtilisateur } from '../models/user/User';
interface JwtPayload {
    id: string;
    role: RoleUtilisateur;
}
export declare const sign: (payload: JwtPayload) => string;
export declare const verify: (token: string) => JwtPayload;
export {};
//# sourceMappingURL=JwtService.d.ts.map