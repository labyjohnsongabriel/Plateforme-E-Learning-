import { Schema, Types } from 'mongoose';
import User, { IUser } from './User';

// Interface pour le document Apprenant
interface IApprenant extends IUser {
  progres: Types.ObjectId[];
  certificats: Types.ObjectId[];
}

// Schéma pour le discriminateur Apprenant
const apprenantSchema = new Schema<IApprenant>({
  progres: [{ type: Schema.Types.ObjectId, ref: 'Progression' }],
  certificats: [{ type: Schema.Types.ObjectId, ref: 'Certificat' }],
});

// Discriminateur pour Apprenant
export default User.discriminator('apprenant', apprenantSchema);