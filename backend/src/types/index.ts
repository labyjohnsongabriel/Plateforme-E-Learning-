// src/types/index.ts
import { Document, Types } from 'mongoose';

// ──────────────────────────────────────────────────
// IMPORTS EXPLICITES DES TYPES DU MODÈLE COURS
// ──────────────────────────────────────────────────
import {
  IModule,
  ISection,
  IContenu,
  ICours,
} from '../models/course/Cours';

// ──────────────────────────────────────────────────
// RÉEXPORTS EXTERNES
// ──────────────────────────────────────────────────
export type { IProgression } from '../models/learning/Progression';
export type { StatutProgression } from '../services/learning/ProgressionService';
export type { NiveauFormation } from '../services/learning/CertificationService';

// Réexport des types du modèle Cours (pour usage externe)
export type { IModule, ISection, IContenu, ICours };

// ──────────────────────────────────────────────────
// ENUMS & INTERFACES DE BASE
// ──────────────────────────────────────────────────
export enum RoleUtilisateur {
  ETUDIANT = 'ETUDIANT',
  ENSEIGNANT = 'ENSEIGNANT',
  ADMIN = 'ADMIN',
}

export type StatutInscription = 'EN_COURS' | 'TERMINE' | 'ANNULE';

// ──────────────────────────────────────────────────
// UTILISATEUR
// ──────────────────────────────────────────────────
export interface Statistics {
  progression: number;
  coursTermines: number;
  coursInscrits: number;
  certificats: number;
  heuresEtude: number;
}
export interface ContenuData {
  titre: string;
  description?: string;
  type: 'VIDEO' | 'DOCUMENT' | 'QUIZ' | 'EXERCICE';
  url?: string;
  cours: string | Types.ObjectId;
  ordre: number;
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
  statistics?: Statistics;

  // Méthodes (optionnelles)
  mettreAJourProfil?(updates: UserData): Promise<void>;
  visualiserProgres?(): Promise<any>;
  gererUtilisateurs?(): Promise<UserDocument[]>;
  genererStatistiques?(): Promise<StatsData>;
}

export interface ApprenantDocument extends UserDocument {}
export interface InstructeurDocument extends UserDocument {}
export interface AdministrateurDocument extends UserDocument {}

export interface IUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  role: RoleUtilisateur;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserData {
  nom?: string;
  prenom?: string;
  email?: string;
  avatar?: string;
}

// ──────────────────────────────────────────────────
// DOMAINE
// ──────────────────────────────────────────────────
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

// ──────────────────────────────────────────────────
// COURS – Types alignés avec le modèle
// ──────────────────────────────────────────────────
export interface CourseDocument extends Document {
  _id: Types.ObjectId;
  titre: string;
  description: string;
  duree: number;
  domaineId: Types.ObjectId;
  niveau: 'ALFA' | 'BETA' | 'GAMMA' | 'DELTA';
  createur: Types.ObjectId;
  instructeurId?: Types.ObjectId;
  etudiants: Types.ObjectId[];
  contenu?: IContenu | null;
  quizzes: Types.ObjectId[];
  estPublie: boolean;
  statutApprobation: 'PENDING' | 'APPROVED' | 'REJECTED';
  progression?: number;
  datePublication?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour création/mise à jour
export interface CourseCreateData {
  titre: string;
  description?: string;
  duree: number;
  domaineId: string | Types.ObjectId;
  niveau: 'ALFA' | 'BETA' | 'GAMMA' | 'DELTA';
  contenu?: IContenu | null;
  quizzes?: (string | Types.ObjectId)[];
  estPublie?: boolean;
  statutApprobation?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface CourseUpdateData {
  titre?: string;
  description?: string;
  duree?: number;
  domaineId?: string | Types.ObjectId;
  niveau?: 'ALFA' | 'BETA' | 'GAMMA' | 'DELTA';
  contenu?: IContenu | null;
  quizzes?: (string | Types.ObjectId)[];
  estPublie?: boolean;
  statutApprobation?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface CourseData {
  titre: string;
  description?: string;
  niveau: string;
  domaineId: string | Types.ObjectId;
  contenu?: IContenu | null;
  createur: string | Types.ObjectId;
  duree: number;
  estPublie?: boolean;
  statutApprobation?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface CourseResponse {
  data: CourseDocument[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface ApprovalData {
  coursId: string;
}

// ──────────────────────────────────────────────────
// NOTIFICATIONS & STATS
// ──────────────────────────────────────────────────
export interface NotificationData {
  utilisateur: string | Types.ObjectId;
  message: string;
  type: string;
  lu?: boolean;
  dateEnvoi?: Date;
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

// ──────────────────────────────────────────────────
// CERTIFICATS & INSCRIPTIONS
// ──────────────────────────────────────────────────
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

export interface EnrollData {
  coursId: string;
}

// ──────────────────────────────────────────────────
// PROGRESSION
// ──────────────────────────────────────────────────
export interface ProgressionUpdateData {
  pourcentage: number;
}

export interface ProgressData {
  coursId: string;
  pourcentage: number;
}

// ──────────────────────────────────────────────────
// QUIZ
// ──────────────────────────────────────────────────
export interface QuizDocument extends Document {
  titre: string;
  description?: string;
  cours: Types.ObjectId;
  questions: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  corriger(reponses: ReponseData): Promise<{ valide: boolean; score: number }>;
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

// ──────────────────────────────────────────────────
// EXPRESS AUGMENTATION
// ──────────────────────────────────────────────────
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