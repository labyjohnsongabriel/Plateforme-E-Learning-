import { IUser } from '../models/user/User';
interface LoginInput {
    email: string;
    motDePasse: string;
}
interface LoginResult {
    token: string;
    user: IUser;
}
export declare const register: (data: Partial<IUser>) => Promise<IUser>;
export declare const login: ({ email, motDePasse }: LoginInput) => Promise<LoginResult>;
export {};
//# sourceMappingURL=AuthService.d.ts.map