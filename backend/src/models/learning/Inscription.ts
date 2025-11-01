import { Schema, model, Document, Types, Model, CallbackError } from 'mongoose';
import { StatutInscription } from '../enums/StatutInscription';
import Cours from '../course/Cours';

/**
 * Interface du modèle Inscription
 */
export interface IInscription extends Document {
  apprenant: Types.ObjectId;
  cours: Types.ObjectId;
  dateInscription: Date;
  statut: StatutInscription;
  dateCompletion?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Méthode d’instance
  estActive(): boolean;
}

/**
 * Définition du schéma Inscription
 */
const inscriptionSchema = new Schema<IInscription>(
  {
    apprenant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'apprenant est requis"],
    },
    cours: {
      type: Schema.Types.ObjectId,
      ref: 'Cours',
      required: [true, 'Le cours est requis'],
      validate: {
        validator: async function (value: Types.ObjectId): Promise<boolean> {
          if (!value || !Types.ObjectId.isValid(value)) return false;
          const cours = await Cours.findById(value).lean();
          return !!cours;
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
      default: StatutInscription.ACTIVE, // ✅ cohérent avec ton enum corrigé
    },
    dateCompletion: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

/**
 * ✅ Index unique (Empêche la double inscription à un même cours)
 */
inscriptionSchema.index({ apprenant: 1, cours: 1 }, { unique: true });

/**
 * ✅ Pré-validation avant sauvegarde
 */
inscriptionSchema.pre('save', async function (next: (err?: CallbackError) => void) {
  try {
    // Validation du cours
    if (!this.cours || !Types.ObjectId.isValid(this.cours.toString())) {
      return next(new Error('Le champ cours est requis et doit être un ObjectId valide.'));
    }

    const cours = await Cours.findById(this.cours).lean();
    if (!cours) {
      return next(new Error("Le cours référencé n'existe pas."));
    }

    // Vérification du statut (facultative mais plus robuste)
    if (!Object.values(StatutInscription).includes(this.statut)) {
      return next(new Error(`Statut d'inscription invalide: ${this.statut}`));
    }

    next();
  } catch (err) {
    next(err instanceof Error ? err : new Error('Erreur de validation du cours.'));
  }
});

/**
 * ✅ Pré-traitement pour les mises à jour
 */
inscriptionSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as any;

  if (update?.cours !== undefined) {
    if (!update.cours || !Types.ObjectId.isValid(update.cours.toString())) {
      return next(new Error('Le champ cours ne peut pas être null et doit être un ObjectId valide.'));
    }

    const cours = await Cours.findById(update.cours).lean();
    if (!cours) {
      return next(new Error("Le cours référencé n'existe pas."));
    }
  }

  if (update?.statut && !Object.values(StatutInscription).includes(update.statut)) {
    return next(new Error(`Statut d'inscription invalide: ${update.statut}`));
  }

  next();
});

/**
 * ✅ Méthode d’instance : savoir si une inscription est encore active
 */
inscriptionSchema.methods.estActive = function (): boolean {
  return this.statut === StatutInscription.ACTIVE;
};

/**
 * ✅ Méthode statique : trouver les inscriptions d’un apprenant
 */
inscriptionSchema.statics.findByApprenant = function (apprenantId: Types.ObjectId) {
  return this.find({ apprenant: apprenantId })
    .populate('cours', 'titre description niveau')
    .where('cours')
    .ne(null);
};

/**
 * ✅ Création du modèle
 */
const Inscription: Model<IInscription> = model<IInscription>('Inscription', inscriptionSchema);

export default Inscription;
