import { Document, Types } from 'mongoose';
export type { IProgression } from '../models/learning/Progression';
export type { StatutProgression } from '../services/learning/ProgressionService';
export declare enum RoleUtilisateur {
    ETUDIANT = "ETUDIANT",
    ENSEIGNANT = "ENSEIGNANT",
    ADMIN = "ADMIN"
}
export interface UserDocument extends Document {
    _id: Types.ObjectId;
    nom: string;
    prenom: string;
    email: string;
    password: string;
    role: RoleUtilisateur;
    avatar?: string | null;
    level?: 'ALFA' | 'BETA' | 'GAMMA' | 'DELTA' | null;
    lastLogin?: Date;
    dateInscription: Date;
    createdAt: Date;
    updatedAt: Date;
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
}
export interface InstructeurDocument extends UserDocument {
}
export interface AdministrateurDocument extends UserDocument {
}
export interface DomaineData {
    nom: string;
    description?: string;
    cours?: Types.ObjectId[];
}
export interface DomaineDocument extends Document, DomaineData {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export interface CourseDocument extends Document {
    titre: string;
    description?: string;
    duree: number;
    niveau: string;
    domaineId: Types.ObjectId;
    contenu?: any;
    quizzes: Types.ObjectId[];
    statutApprobation: 'PENDING' | 'APPROVED' | 'REJECTED';
    createur: string | Types.ObjectId;
    estPublie: boolean;
    createdAt: Date;
}
export interface CourseCreateData {
    titre: string;
    description?: string;
    duree: number;
    domaineId: Types.ObjectId;
    niveau: 'ALFA' | 'BETA' | 'GAMMA' | 'DELTA';
    contenu?: any[];
    quizzes?: any[];
    statutApprobation?: 'PENDING' | 'APPROVED' | 'REJECTED';
    estPublie?: boolean;
}
export interface CourseUpdateData {
    coursId: string;
    titre?: string;
    description?: string;
    duree?: number;
    domaineId?: Types.ObjectId;
    niveau?: 'ALFA' | 'BETA' | 'GAMMA' | 'DELTA';
    contenu?: any[];
    quizzes?: any[];
    statutApprobation?: 'PENDING' | 'APPROVED' | 'REJECTED';
    estPublie?: boolean;
}
export interface CourseData {
    titre: string;
    description?: string;
    niveau: string;
    domaineId: string;
    contenu?: any;
    createur: string | Types.ObjectId;
}
export interface CourseResponse {
    data: CourseDocument[];
    totalPages: number;
    currentPage: number;
}
export interface ApprovalData {
    coursId: string;
}
export interface NotificationData {
    utilisateur: string | Types.ObjectId;
    message: string;
    type: string;
    lu?: boolean;
    dateEnvoi?: Date;
}
export interface UserData {
    nom?: string;
    prenom?: string;
    email?: string;
    avatar?: string;
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
    apprenant: string | Types.ObjectId;
    cours: string | Types.ObjectId;
    dateEmission: Date;
    urlCertificat: string;
}
export interface InscriptionDocument extends Document {
    apprenant: string | Types.ObjectId;
    cours: string | Types.ObjectId;
    dateInscription: Date;
}
export interface InscriptionData {
    coursId: string;
}
export interface ProgressionUpdateData {
    pourcentage: number;
}
export interface EnrollData {
    coursId: string;
}
export interface ProgressData {
    coursId: string;
    pourcentage: number;
}
export interface ContenuDocument extends Document {
    titre: string;
    description?: string;
    type: 'VIDEO' | 'DOCUMENT' | 'QUIZ' | 'EXERCICE';
    url: string;
    cours: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export interface ContenuData {
    titre: string;
    description?: string;
    type: 'VIDEO' | 'DOCUMENT' | 'QUIZ' | 'EXERCICE';
    url?: string;
    cours: string | Types.ObjectId;
}
export interface QuizDocument extends Document {
    titre: string;
    description?: string;
    cours: Types.ObjectId;
    questions: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    corriger(reponses: ReponseData): Promise<{
        valide: boolean;
        score: number;
    }>;
}
export interface QuizData {
    titre: string;
    description?: string;
    cours: string | Types.ObjectId;
    questions?: (string | Types.ObjectId)[];
}
export interface ReponseData {
    [questionId: string]: string | string[];
}
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: RoleUtilisateur;
                email: string;
            };
        }
    }
}
//# sourceMappingURL=index.d.ts.map