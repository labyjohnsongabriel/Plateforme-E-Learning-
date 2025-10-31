// src/models/learning/Inscription.ts
import { Schema, model, Document, Types, Model, CallbackError } from 'mongoose';
import { StatutInscription } from '../enums/StatutInscription';
import Cours from '../course/Cours';

export interface IInscription extends Document {
  apprenant: Types.ObjectId;
  cours: Types.ObjectId;
  dateInscription: Date;
  statut: StatutInscription;
  createdAt: Date;
  updatedAt: Date;
}

const inscriptionSchema = new Schema<IInscription>(
  {
    apprenant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'apprenant est requis'],
    },
    cours: {
      type: Schema.Types.ObjectId,
      ref: 'Cours',
      required: [true, 'Le cours est requis'],
      validate: {
        validator: async function (value: Types.ObjectId): Promise<boolean> {
          if (!value || !Types.ObjectId.isValid(value)) {
            return false;
          }
          try {
            const cours = await Cours.findById(value).lean();
            return !!cours;
          } catch {
            return false;
          }
        },
        message: 'Le cours spécifié est invalide ou n\'existe pas.',
      },
    },
    dateInscription: {
      type: Date,
      default: Date.now,
    },
    statut: {
      type: String,
      enum: Object.values(StatutInscription),
      default: StatutInscription.EN_COURS,
    },
  },
  { timestamps: true }
);

// ✅ INDEX UNIQUE CORRIGÉ - Plus de filtre partiel
inscriptionSchema.index(
  { apprenant: 1, cours: 1 },
  { unique: true }
);

// ✅ PRE-SAVE CORRIGÉ - Validation stricte
inscriptionSchema.pre('save', async function (next: (err?: CallbackError) => void) {
  try {
    // Validation du cours
    if (!this.cours || !Types.ObjectId.isValid(this.cours.toString())) {
      return next(new Error('Le champ cours est requis et doit être un ObjectId valide.'));
    }

    const cours = await Cours.findById(this.cours).lean();
    if (!cours) {
      return next(new Error('Le cours référencé n\'existe pas.'));
    }

    next();
  } catch (err) {
    next(err instanceof Error ? err : new Error('Erreur de validation du cours'));
  }
});

// ✅ PRE-FINDONEANDUPDATE CORRIGÉ
inscriptionSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as any;
  
  if (update?.cours !== undefined) {
    if (!update.cours || !Types.ObjectId.isValid(update.cours.toString())) {
      return next(new Error('Le champ cours ne peut pas être null et doit être un ObjectId valide.'));
    }
    
    try {
      const cours = await Cours.findById(update.cours).lean();
      if (!cours) {
        return next(new Error('Le cours référencé n\'existe pas.'));
      }
    } catch (err) {
      return next(new Error('Erreur lors de la validation du cours.'));
    }
  }
  next();
});

// ✅ CORRECTION DE LA MÉTHODE ESTACTIVE
inscriptionSchema.methods.estActive = function (): boolean {
  return this.statut === StatutInscription.EN_COURS;
};

// ✅ CORRECTION DE LA MÉTHODE STATIC
inscriptionSchema.statics.findByApprenant = function (apprenantId: Types.ObjectId) {
  return this.find({ apprenant: apprenantId })
    .populate('cours', 'titre description')
    .where('cours').ne(null); // ✅ Exclut les inscriptions avec cours null
};

const Inscription: Model<IInscription> = model<IInscription>('Inscription', inscriptionSchema);

export default Inscription;