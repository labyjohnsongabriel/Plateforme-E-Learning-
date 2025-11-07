// src/models/course/Contenu.ts
import { Schema, model, Document, Types, Model } from 'mongoose';

export interface IContenu extends Document {
  _id: Types.ObjectId;
  titre: string;
  description?: string;
  url: string;
  duree: number; // CHANGÉ: rendu obligatoire
  ordre: number;
  cours: Types.ObjectId;
  type: 'VIDEO' | 'DOCUMENT' | 'QUIZ' | 'EXERCICE';
  completedBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  visualiser(utilisateurId: Types.ObjectId): Promise<{ message: string }>;
}

// Interfaces discriminées
interface IVideo extends IContenu {}
interface IDocument extends IContenu { 
  format?: 'PDF' | 'DOC' | 'OTHER'; // CHANGÉ: majuscules pour correspondre à l'enum
}
interface IExercice extends IContenu { 
  instructions?: string; 
}

// Schéma principal
const contenuSchema = new Schema<IContenu>(
  {
    titre: { type: String, required: true },
    description: { type: String },
    url: { type: String, required: true },
    duree: { type: Number, required: true }, // CHANGÉ: rendu obligatoire
    ordre: { type: Number, required: true },
    cours: { type: Schema.Types.ObjectId, ref: 'Cours', required: true },
    type: {
      type: String,
      enum: ['VIDEO', 'DOCUMENT', 'QUIZ', 'EXERCICE'],
      required: true,
    },
    completedBy: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  { discriminatorKey: 'type', timestamps: true }
);

// Méthode visualiser
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

// Modèle
const Contenu: Model<IContenu> = model<IContenu>('Contenu', contenuSchema);

// Discriminateurs - CORRIGÉ: formats en majuscules
Contenu.discriminator('VIDEO', new Schema<IVideo>({}));
Contenu.discriminator('DOCUMENT', new Schema<IDocument>({ 
  format: { type: String, enum: ['PDF', 'DOC', 'OTHER'] } 
}));
Contenu.discriminator('EXERCICE', new Schema<IExercice>({ 
  instructions: { type: String } 
}));

export default Contenu;