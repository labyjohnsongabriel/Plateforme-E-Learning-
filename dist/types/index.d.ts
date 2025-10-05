import { Document, Types } from 'mongoose';
export interface UserDocument extends Document {
    id: string;
    role: RoleUtilisateur;
    coursCrees?: Types.ObjectId[];
    coursEnCoursEdition?: Types.ObjectId[];
    progres?: Types.ObjectId[];
    certificats?: Types.ObjectId[];
    mettreAJourProfil?: (updates: UserData) => Promise<void>;
    visualiserProgres?: () => Promise<any>;
    gererUtilisateurs?: () => Promise<UserDocument[]>;
    genererStatistiques?: () => Promise<StatsData>;
}
export interface ApprenantDocument extends UserDocument {
    role: 'APPRENANT';
}
export interface AdministrateurDocument extends UserDocument {
    role: 'ADMIN';
}
export interface CourseDocument extends Document {
    titre: string;
    description?: string;
    niveau: string;
    domaine: string;
    contenu?: any;
    statutApprobation: 'PENDING' | 'APPROVED' | 'REJECTED';
    instructeur: string | Types.ObjectId;
    createdAt: Date;
}
export interface CourseCreateData {
    titre: string;
    description?: string;
    niveau: string;
    domaine: string;
    contenu?: any;
    statutApprobation?: 'PENDING' | 'APPROVED' | 'REJECTED';
}
export interface CourseUpdateData {
    coursId: string;
    titre?: string;
    description?: string;
    niveau?: string;
    domaine?: string;
    contenu?: any;
}
export interface CourseData {
    titre: string;
    description?: string;
    niveau: string;
    domaine: string;
    contenu?: any;
    instructeur: string | Types.ObjectId;
}
export interface ApprovalData {
    coursId: string;
}
export interface UserData {
    name?: string;
    email?: string;
}
export interface StatsData {
    totalUsers?: number;
    totalCourses?: number;
}
export interface GlobalStats {
    totalUsers: number;
    totalCourses: number;
    totalInscriptions: number;
    averageCompletionRate: number;
}
export interface UserStats {
    userId: string;
    coursesEnrolled: number;
    coursesCompleted: number;
    averageProgress: number;
}
export interface CourseStats {
    coursId: string;
    totalEnrollments: number;
    completionRate: number;
    averageTimeToComplete: number;
}
export interface CertificatDocument extends Document {
    utilisateur: string;
    dateEmission: Date;
    urlCertificat: string;
    cours: string | Types.ObjectId;
}
export interface InscriptionDocument extends Document {
    apprenant: string | Types.ObjectId;
    cours: string | Types.ObjectId;
    dateInscription: Date;
}
export interface ProgressionDocument extends Document {
    apprenant: string | Types.ObjectId;
    cours: string | Types.ObjectId;
    pourcentage: number;
    dateDebut: Date;
    dateFin?: Date;
}
export interface EnrollData {
    coursId: string;
}
export interface ProgressData {
    coursId: string;
    pourcentage: number;
}
export type RoleUtilisateur = 'APPRENANT' | 'INSTRUCTEUR' | 'ADMIN';
//# sourceMappingURL=index.d.ts.map