import { Schema, model, Document, Types, Model, CallbackError } from 'mongoose';
import { StatutInscription } from '../enums/StatutInscription';
import Cours from '../course/Cours';

export interface IInscription extends Document {
  apprenant: Types.ObjectId;
  cours: Types.ObjectId;
  dateInscription: Date;
  statut: StatutInscription;
  dateCompletion?: Date;
  createdAt: Date;
  updatedAt: Date;

  estActive(): boolean;
}

const inscriptionSchema = new Schema<IInscription>(
  {
    apprenant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'apprenant est requis"],
      index: true
    },
    cours: {
      type: Schema.Types.ObjectId,
      ref: 'Cours',
      required: [true, 'Le cours est requis'],
      index: true,
      validate: {
        validator: async function (value: Types.ObjectId): Promise<boolean> {
          if (!value || !Types.ObjectId.isValid(value)) return false;
          try {
            const cours = await Cours.findById(value).select('_id').lean();
            return !!cours;
          } catch {
            return false;
          }
        },
        message: "Le cours spécifié est invalide ou n'existe pas.",
      },
    },
    dateInscription: {
      type: Date,
      default: Date.now,
    },
    statut: {
      type: String,
      enum: Object.values(StatutInscription),
      default: StatutInscription.ACTIVE,
    },
    dateCompletion: {
      type: Date,
      default: null,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index unique pour éviter les doublons
inscriptionSchema.index({ apprenant: 1, cours: 1 }, { 
  unique: true,
  name: 'unique_enrollment'
});

// Validation avant sauvegarde
inscriptionSchema.pre('save', async function (next) {
  try {
    // Vérification que le cours existe
    const cours = await Cours.findById(this.cours).select('_id estPublie').lean();
    if (!cours) {
      return next(new Error("Le cours référencé n'existe pas."));
    }

    if (!cours.estPublie) {
      return next(new Error("Impossible de s'inscrire à un cours non publié."));
    }

    next();
  } catch (err) {
    next(err as CallbackError);
  }
});

// Méthode d'instance
inscriptionSchema.methods.estActive = function (): boolean {
  return this.statut === StatutInscription.ACTIVE;
};

// Méthodes statiques
inscriptionSchema.statics.findByApprenant = function (apprenantId: Types.ObjectId) {
  return this.find({ apprenant: apprenantId })
    .populate('cours', 'titre description niveau image instructeurId')
    .populate('apprenant', 'nom prenom email')
    .where('cours').ne(null);
};

inscriptionSchema.statics.findByCours = function (coursId: Types.ObjectId) {
  return this.find({ cours: coursId })
    .populate('apprenant', 'nom prenom email photo')
    .sort({ dateInscription: -1 });
};

const Inscription: Model<IInscription> = model<IInscription>('Inscription', inscriptionSchema);

export default Inscription;