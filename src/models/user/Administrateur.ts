// src/models/user/Administrateur.ts
import { Schema } from 'mongoose';
import { User, IUser } from './User';

// Interface pour le document Administrateur
interface IAdministrateur extends IUser {}

// Schéma pour le discriminateur Administrateur
const administrateurSchema = new Schema<IAdministrateur>({});

// Discriminateur pour Administrateur
export const Administrateur = User.discriminator<IAdministrateur>('Administrateur', administrateurSchema);