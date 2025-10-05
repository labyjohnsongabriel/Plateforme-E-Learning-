// src/models/user/User.ts
import { Schema, model, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

// Enum pour les rôles utilisateur
export enum RoleUtilisateur {
  ETUDIANT = 'ETUDIANT',
  ENSEIGNANT = 'ENSEIGNANT',
  ADMIN = 'ADMIN',
}

// Interface pour le document User
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

// Interface pour les discriminateurs
export interface IApprenant extends IUser {
  visualiserProgres(): Promise<any>;
}

export interface IAdministrateur extends IUser {
  gererUtilisateurs(): Promise<IUser[]>;
  genererStatistiques(): Promise<any>;
}

// Interface pour les méthodes statiques
interface IUserModel extends Model<IUser> {}

// Schéma pour User
const userSchema = new Schema<IUser>(
  {
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(RoleUtilisateur),
      default: RoleUtilisateur.ETUDIANT,
    },
    avatar: { type: String, required: false },
    level: {
      type: String,
      enum: ['ALFA', 'BETA', 'GAMMA', 'DELTA'],
      default: 'ALFA',
    },
    lastLogin: { type: Date, required: false },
    dateInscription: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true, discriminatorKey: 'role' }
);

// Middleware pour hacher le mot de passe avant sauvegarde
userSchema.pre('save', async function (this: IUser, next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Méthode pour comparer le mot de passe
userSchema.methods.comparePassword = async function (this: IUser, password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Méthode pour mettre à jour le profil
userSchema.methods.mettreAJourProfil = async function (
  this: IUser,
  updates: Partial<Pick<IUser, 'nom' | 'prenom' | 'email' | 'avatar'>>
): Promise<IUser> {
  const allowedUpdates = ['nom', 'prenom', 'email', 'avatar'];
  for (const [key, value] of Object.entries(updates)) {
    if (allowedUpdates.includes(key)) {
      (this as any)[key] = value; // Workaround for TypeScript strict property assignment
    }
  }
  await this.save();
  return this;
};

// Schéma pour le discriminateur Apprenant
const apprenantSchema = new Schema<IApprenant>({});

// Méthode pour visualiser le progrès
apprenantSchema.methods.visualiserProgres = async function (this: IApprenant): Promise<any> {
  const certificats = await mongoose.model('Certificat').find({ utilisateur: this._id });
  return { certificatsCount: certificats.length, completed: certificats.length > 0 };
};

// Schéma pour le discriminateur Administrateur
const administrateurSchema = new Schema<IAdministrateur>({});

// Méthode pour gérer les utilisateurs
administrateurSchema.methods.gererUtilisateurs = async function (this: IAdministrateur): Promise<IUser[]> {
  return User.find({ role: { $ne: RoleUtilisateur.ADMIN } }); // Exclure les admins
};

// Méthode pour générer des statistiques
administrateurSchema.methods.genererStatistiques = async function (this: IAdministrateur): Promise<any> {
  const totalUsers = await User.countDocuments();
  const etudiants = await User.countDocuments({ role: RoleUtilisateur.ETUDIANT });
  return { totalUsers, etudiants };
};

// Modèle User et discriminateurs
const User = model<IUser, IUserModel>('User', userSchema);
const Apprenant = User.discriminator<IApprenant>('Apprenant', apprenantSchema, RoleUtilisateur.ETUDIANT);
const Administrateur = User.discriminator<IAdministrateur>('Administrateur', administrateurSchema, RoleUtilisateur.ADMIN);

export { User, Apprenant, Administrateur };