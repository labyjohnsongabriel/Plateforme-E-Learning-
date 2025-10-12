// src/models/course/Cours.ts (modèle inchangé, mais confirmé pour compatibilité)
import { Schema, model, Document, Types, Model } from 'mongoose';
import { ProgressionUpdateData } from '../../types';
import { NiveauFormation } from '../../services/learning/CertificationService';

// Interface pour le document Cours
export interface ICours extends Document {
  titre: string;
  description: string;
  duree: number;
  domaineId: Types.ObjectId;
  niveau: NiveauFormation;
  createur: Types.ObjectId;
  contenu: Types.ObjectId[];
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
    domaineId: { type: Schema.Types.ObjectId, ref: 'Domaine', required: true },
    niveau: {
      type: String,
      enum: Object.values(NiveauFormation),
      required: true,
    },
    createur: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    contenu: [{ type: Schema.Types.ObjectId, ref: 'Contenu', default: [] }],
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
  if (!this.contenu.includes(contenuId)) {
    this.contenu.push(contenuId);
    await this.save();
  }
  return this;
};

// Méthode pour publier le cours
coursSchema.methods.publier = async function (this: ICours): Promise<ICours> {
  this.estPublie = true;
  this.datePublication = new Date();
  await this.save();

  // Création de notification (à adapter si tu as un modèle Notification)
  try {
    const Notification = model('Notification');
    await Notification.create({
      message: `Le cours "${this.titre}" est maintenant publié !`,
      type: 'RAPPEL_COURS',
      destinataires: [],
    });
  } catch (err) {
    console.warn('Notification non créée :', (err as Error).message);
  }

  return this;
};

// Méthode pour calculer la complétion moyenne
coursSchema.methods.calculerCompletionMoyenne = async function (
  this: ICours
): Promise<number> {
  const Progression = model<ProgressionUpdateData>('Progression');
  const result = await Progression.aggregate([
    { $match: { cours: this._id } },
    { $group: { _id: null, moyenne: { $avg: '$pourcentage' } } },
  ]);
  return result.length > 0 ? result[0].moyenne || 0 : 0;
}

// Modèle Cours
const Cours: Model<ICours> = model<ICours>('Cours', coursSchema);

export default Cours;