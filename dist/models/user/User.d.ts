import { Document, Model } from 'mongoose';
export declare enum RoleUtilisateur {
    ETUDIANT = "ETUDIANT",
    ENSEIGNANT = "ENSEIGNANT",
    ADMIN = "ADMIN"
}
export interface IUser extends Document {
    nom: string;
    prenom: string;
    email: string;
    password: string;
    role: RoleUtilisateur;
    avatar?: string;
    level: 'ALFA' | 'BETA' | 'GAMMA' | 'DELTA';
    lastLogin?: Date;
    dateInscription: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(password: string): Promise<boolean>;
    mettreAJourProfil(updates: Partial<Pick<IUser, 'nom' | 'prenom' | 'email' | 'avatar'>>): Promise<IUser>;
}
export interface IApprenant extends IUser {
    visualiserProgres(): Promise<any>;
}
export interface IAdministrateur extends IUser {
    gererUtilisateurs(): Promise<IUser[]>;
    genererStatistiques(): Promise<any>;
}
interface IUserModel extends Model<IUser> {
}
declare const User: IUserModel;
declare const Apprenant: Model<IApprenant, {}, {}, {}, Document<unknown, {}, IApprenant, {}, {}> & IApprenant & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
declare const Administrateur: Model<IAdministrateur, {}, {}, {}, Document<unknown, {}, IAdministrateur, {}, {}> & IAdministrateur & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export { User, Apprenant, Administrateur };
//# sourceMappingURL=User.d.ts.map