import { Schema, Types, Model } from 'mongoose';
import User, { IUser } from './User';

// Interface pour le document Instructeur
interface IInstructeur extends IUser {
  coursCrees: Types.ObjectId[];
  coursEnCoursEdition: Types.ObjectId[];
  statutApprobation: 'PENDING' | 'APPROVED' | 'REJECTED';
  biographie?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schéma pour le discriminateur Instructeur
const instructeurSchema = new Schema<IInstructeur>(
  {
    coursCrees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Cours',
        required: true,
      },
    ],
    coursEnCoursEdition: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Cours',
      },
    ],
    statutApprobation: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    biographie: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// Index pour optimiser les recherches par cours créés
instructeurSchema.index({ coursCrees: 1 }, { unique: false, partialFilterExpression: { coursCrees: { $exists: true } } });

// Middleware pour population automatique
instructeurSchema.pre('find', function (this: any, next) {
  this.populate('coursCrees coursEnCoursEdition');
  next();
});

// Discriminateur pour Instructeur
export default User.discriminator('Instructeur', instructeurSchema);