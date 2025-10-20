import { Schema, model, Document, Types, Model } from 'mongoose';

// Interface pour le document Contenu
export interface IContenu extends Document {
  _id: Types.ObjectId;
  titre: string;
  description?: string;
  url: string;
  duree?: number;
  ordre: number;
  cours: Types.ObjectId;
  type: 'VIDEO' | 'DOCUMENT' | 'QUIZ' | 'EXERCICE';
  createdAt: Date;
  updatedAt: Date;
  visualiser(utilisateurId: Types.ObjectId): Promise<{ message: string }>;
}

// Interface pour le document Vidéo
interface IVideo extends IContenu {}

// Interface pour le document Document
interface IDocument extends IContenu {
  format?: 'pdf' | 'doc' | 'other';
}

// Interface pour le document Exercice
interface IExercice extends IContenu {
  instructions?: string;
}

// Schéma de base pour Contenu
const contenuSchema = new Schema<IContenu>(
  {
    titre: { type: String, required: true },
    description: { type: String },
    url: { type: String, required: true },
    duree: { type: Number },
    ordre: { type: Number, required: true },
    cours: { type: Schema.Types.ObjectId, ref: 'Cours', required: true },
    type: {
      type: String,
      enum: ['VIDEO', 'DOCUMENT', 'QUIZ', 'EXERCICE'],
      required: true,
    },
  },
  { discriminatorKey: 'type', timestamps: true }
);

// Méthode pour visualiser le contenu
contenuSchema.methods.visualiser = async function (
  this: IContenu,
  utilisateurId: Types.ObjectId
): Promise<{ message: string }> {
  const Progression = model('Progression');
  await Progression.updateOne(
    { utilisateur: utilisateurId, cours: this.cours },
    { $set: { dateDerniereActivite: new Date() }, $inc: { avancement: 5 } },
    { upsert: true }
  );
  return { message: `Contenu "${this.titre}" visualisé.` };
};

// Modèle de base Contenu
const Contenu: Model<IContenu> = model<IContenu>('Contenu', contenuSchema);

// Schéma pour Vidéo
const videoSchema = new Schema<IVideo>({});

// Schéma pour Document
const documentSchema = new Schema<IDocument>({
  format: { type: String, enum: ['pdf', 'doc', 'other'] },
});

// Schéma pour Exercice
const exerciceSchema = new Schema<IExercice>({
  instructions: { type: String },
});

// Discriminateurs
Contenu.discriminator('VIDEO', videoSchema);
Contenu.discriminator('DOCUMENT', documentSchema);
Contenu.discriminator('EXERCICE', exerciceSchema);

export default Contenu;