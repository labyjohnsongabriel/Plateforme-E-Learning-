import { IUser } from './User';
interface IAdministrateur extends IUser {
}
export declare const Administrateur: import("mongoose").Model<IAdministrateur, {}, {}, {}, import("mongoose").Document<unknown, {}, IAdministrateur, {}, {}> & IAdministrateur & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export {};
//# sourceMappingURL=Administrateur.d.ts.map