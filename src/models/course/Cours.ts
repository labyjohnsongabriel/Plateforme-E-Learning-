import { Schema, model, Document, Types, Model } from 'mongoose';

// Interface pour le document Cours
interface ICours extends Document {
  titre: string;
  description: string;
  duree: number;
  domaineId: Types.ObjectId;
  niveau: 'ALFA' | 'BETA' | 'GAMMA' | 'DELTA';
  createur: Types.ObjectId;
  contenus: Types.ObjectId[];
  quizzes: Types.ObjectId[];
  datePublication?: Date;
  estPublie: boolean;
  createdAt: Date;
  updatedAt: Date;
  statutApprobation: 'PENDING' | 'APPROVED' | 'REJECTED';
  ajouterContenu(contenuId: Types.ObjectId): Promise<ICours>;
  publier(): Promise<ICours>;
  calculerCompletionMoyenne(): Promise<number>;
}

// Schéma pour Cours
const coursSchema = new Schema<ICours>(
  {
    titre: { type: String, required: true },
    description: { type: String, required: false, default: '' },
    duree: { type: Number, required: true },
    domaineId: {
      type: Schema.Types.ObjectId,
      ref: 'Domaine',
      required: true,
    },
    niveau: {
      type: String,
      enum: ['ALFA', 'BETA', 'GAMMA', 'DELTA'],
      required: true,
    },
    createur: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contenus: [{ type: Schema.Types.ObjectId, ref: 'Contenu', default: [] }],
    quizzes: [{ type: Schema.Types.ObjectId, ref: 'Quiz', default: [] }],
    datePublication: { type: Date },
    estPublie: { type: Boolean, default: false },
    statutApprobation: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      required: true,
    },
  },
  { timestamps: true }
);

// Méthode pour ajouter du contenu
coursSchema.methods.ajouterContenu = async function (
  this: ICours,
  contenuId: Types.ObjectId
): Promise<ICours> {
  if (!this.contenus.includes(contenuId)) {
    this.contenus.push(contenuId);
    await this.save();
  }
  return this;
};

// Méthode pour publier le cours
coursSchema.methods.publier = async function (
  this: ICours
): Promise<ICours> {
  this.estPublie = true;
  this.datePublication = new Date();
  await this.save();
  const Notification = model('Notification');
  await Notification.create({
    message: `Le cours "${this.titre}" est maintenant publié !`,
    type: 'RAPPEL_COURS',
    destinataires: [],
  });
  return this;
};

// Méthode pour calculer la complétion moyenne
coursSchema.methods.calculerCompletionMoyenne = async function (
  this: ICours
): Promise<number> {
  const Progression = model<ProgressionDocument>('Progression');
  const progressions = await Progression.aggregate([
    { $match: { cours: this._id } },
    { $group: { _id: null, moyenne: { $avg: '$pourcentage' } } },
  ]);
  return progressions.length > 0 ? progressions[0].moyenne : 0;
};

// Modèle Cours
const Cours: Model<ICours> = model<ICours>('Cours', coursSchema);

export default Cours;