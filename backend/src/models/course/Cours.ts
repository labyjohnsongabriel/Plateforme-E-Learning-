// src/models/course/Cours.ts
import { Schema, model, Document, Types, Model } from 'mongoose';
export interface IModule {
  titre: string;
  type: 'VIDEO' | 'TEXTE' | 'QUIZ' | 'DOCUMENT';
  contenu: string; // URL ou ID du quiz
  duree: number; // en minutes
  ordre: number;
}

export interface ISection {
  titre: string;
  description?: string;
  ordre: number;
  modules: IModule[];
}

export interface IContenu {
  sections: ISection[];
}

export interface ICours extends Document {
  _id: Types.ObjectId;
  titre: string;
  description: string; // Requis dans le schéma, donc non optionnel ici
  duree: number;
  domaineId: Types.ObjectId;
  niveau: 'ALFA' | 'BETA' | 'GAMMA' | 'DELTA';
  createur: Types.ObjectId;
  instructeurId?: Types.ObjectId;
  etudiants: Types.ObjectId[];
  contenu?: IContenu | null; // AUTORISE NULL
  quizzes: Types.ObjectId[];
  datePublication?: Date;
  estPublie: boolean;
  statutApprobation: 'PENDING' | 'APPROVED' | 'REJECTED';
  progression?: number;
  dateCreation?: Date; // Virtual
  updatedAt: Date;
  createdAt: Date;

  // Méthodes
  ajouterContenu(contenuId: Types.ObjectId): Promise<ICours>;
  publier(): Promise<ICours>;
  calculerCompletionMoyenne(): Promise<number>;
  ajouterEtudiant(etudiantId: Types.ObjectId): Promise<ICours>;
}

// ──────────────────────────────────────────────────
// SCHÉMAS EMBARQUÉS
// ──────────────────────────────────────────────────
const moduleSchema = new Schema<IModule>({
  titre: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['VIDEO', 'TEXTE', 'QUIZ', 'DOCUMENT'],
    required: true,
  },
  contenu: { type: String, required: true },
  duree: { type: Number, required: true, min: 1 },
  ordre: { type: Number, required: true },
});

const sectionSchema = new Schema<ISection>({
  titre: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  ordre: { type: Number, required: true },
  modules: [moduleSchema],
});

const contenuSchema = new Schema<IContenu>({
  sections: {
    type: [sectionSchema],
    default: [], // Tableau vide par défaut
  },
});

// ──────────────────────────────────────────────────
// SCHÉMA PRINCIPAL
// ──────────────────────────────────────────────────
const coursSchema = new Schema<ICours>(
  {
    titre: {
      type: String,
      required: [true, 'Le titre est requis'],
      trim: true,
      maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères'],
    },
    description: {
      type: String,
      required: [true, 'La description est requise'],
      maxlength: [500, 'La description ne peut pas dépasser 500 caractères'],
    },
    duree: {
      type: Number,
      required: [true, 'La durée est requise'],
      min: [1, 'La durée doit être d\'au moins 1 heure'],
    },
    domaineId: {
      type: Schema.Types.ObjectId,
      ref: 'Domaine',
      required: [true, 'Le domaine est requis'],
    },
    niveau: {
      type: String,
      enum: {
        values: ['ALFA', 'BETA', 'GAMMA', 'DELTA'],
        message: 'Niveau invalide. Doit être ALFA, BETA, GAMMA ou DELTA',
      },
      required: [true, 'Le niveau est requis'],
    },
    createur: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Le créateur est requis'],
    },
    instructeurId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    etudiants: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    contenu: {
      type: contenuSchema,
      default: { sections: [] }, // Compatible avec null via update
    },
    quizzes: {
      type: [Schema.Types.ObjectId],
      ref: 'Quiz',
      default: [],
    },
    progression: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    datePublication: { type: Date },
    estPublie: {
      type: Boolean,
      default: false,
    },
    statutApprobation: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ──────────────────────────────────────────────────
// INDEX
// ──────────────────────────────────────────────────
coursSchema.index({ domaineId: 1 });
coursSchema.index({ createur: 1 });
coursSchema.index({ etudiants: 1 });
coursSchema.index({ estPublie: 1, statutApprobation: 1 });

// ──────────────────────────────────────────────────
// VIRTUALS
// ──────────────────────────────────────────────────
coursSchema.virtual('dateCreation').get(function (this: ICours) {
  return this.createdAt;
});

// ──────────────────────────────────────────────────
// MÉTHODES D'INSTANCE
// ──────────────────────────────────────────────────
coursSchema.methods.ajouterContenu = async function (
  this: ICours,
  contenuId: Types.ObjectId
): Promise<ICours> {
  console.warn('Méthode obsolète: utiliser contenu.sections directement');
  return this;
};

coursSchema.methods.ajouterEtudiant = async function (
  this: ICours,
  etudiantId: Types.ObjectId
): Promise<ICours> {
  if (!this.etudiants.includes(etudiantId)) {
    this.etudiants.push(etudiantId);
    await this.save();
  }
  return this;
};

coursSchema.methods.publier = async function (this: ICours): Promise<ICours> {
  this.estPublie = true;
  this.datePublication = new Date();
  this.statutApprobation = 'APPROVED';
  await this.save();

  try {
    const Notification = model('Notification');
    await Notification.create({
      message: `Le cours "${this.titre}" est maintenant publié !`,
      type: 'RAPPEL_COURS',
      destinataires: this.etudiants,
    });
  } catch (err) {
    console.warn('Notification non créée:', (err as Error).message);
  }

  return this;
};

coursSchema.methods.calculerCompletionMoyenne = async function (): Promise<number> {
  try {
    const Progression = model('Progression');
    const result = await Progression.aggregate([
      { $match: { cours: this._id } },
      { $group: { _id: null, moyenne: { $avg: '$pourcentage' } } },
    ]);
    return result.length > 0 ? Math.round(result[0].moyenne || 0) : 0;
  } catch (err) {
    console.error('Erreur calcul completion moyenne:', err);
    return 0;
  }
};

// ──────────────────────────────────────────────────
// HOOKS
// ──────────────────────────────────────────────────
coursSchema.pre('save', function (next) {
  if (!this.instructeurId) {
    this.instructeurId = this.createur;
  }
  next();
});

// ──────────────────────────────────────────────────
// STATICS
// ──────────────────────────────────────────────────
coursSchema.statics.findByEtudiant = function (etudiantId: Types.ObjectId) {
  return this.find({ etudiants: etudiantId })
    .populate('domaineId', 'nom')
    .populate('instructeurId', 'prenom nom email')
    .populate('createur', 'prenom nom');
};

// ──────────────────────────────────────────────────
// MODÈLE
// ──────────────────────────────────────────────────
const Cours: Model<ICours> = model<ICours>('Cours', coursSchema);

export default Cours;