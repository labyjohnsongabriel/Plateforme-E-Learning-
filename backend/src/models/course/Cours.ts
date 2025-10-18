// Backend: Cours model (complete corrected code)
import { Schema, model, Document, Types, Model } from 'mongoose';

export interface ICours extends Document {
  _id: Types.ObjectId;
  titre: string;
  description: string;
  duree: number;
  domaineId: Types.ObjectId;
  niveau: string;
  createur: Types.ObjectId;
  etudiants: Types.ObjectId[];
  contenu: Types.ObjectId[];
  quizzes: Types.ObjectId[];
  datePublication?: Date;
  estPublie: boolean;
  statutApprobation: 'PENDING' | 'APPROVED' | 'REJECTED';
  progression?: number;
  instructeurId?: Types.ObjectId;
  dateCreation?: Date;
  updatedAt: Date;
  createdAt: Date;
  ajouterContenu(contenuId: Types.ObjectId): Promise<ICours>;
  publier(): Promise<ICours>;
  calculerCompletionMoyenne(): Promise<number>;
  ajouterEtudiant(etudiantId: Types.ObjectId): Promise<ICours>;
}

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
        message: 'Niveau de formation invalide. Doit être ALFA, BETA, GAMMA ou DELTA'
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
    etudiants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: [],
      },
    ],
    contenu: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Module',
        default: [],
      },
    ],
    quizzes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Quiz',
        default: [],
      },
    ],
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

coursSchema.index({ domaineId: 1 });
coursSchema.index({ createur: 1 });
coursSchema.index({ etudiants: 1 });
coursSchema.index({ estPublie: 1, statutApprobation: 1 });

coursSchema.virtual('dateCreation').get(function (this: ICours) {
  return this.createdAt;
});

coursSchema.methods.ajouterContenu = async function (
  this: ICours,
  contenuId: Types.ObjectId
): Promise<ICours> {
  if (!this.contenu.includes(contenuId)) {
    this.contenu.push(contenuId);
    await this.save();
  }
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
    console.warn('Notification non créée :', (err as Error).message);
  }

  return this;
};

coursSchema.methods.calculerCompletionMoyenne = async function (
  this: ICours
): Promise<number> {
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

coursSchema.pre('save', function (next) {
  if (!this.instructeurId) {
    this.instructeurId = this.createur;
  }
  next();
});

coursSchema.statics.findByEtudiant = function (etudiantId: Types.ObjectId) {
  return this.find({ etudiants: etudiantId })
    .populate('domaineId')
    .populate('instructeurId', 'prenom nom email')
    .populate('createur', 'prenom nom');
};

const Cours: Model<ICours> = model<ICours>('Cours', coursSchema);

export default Cours;