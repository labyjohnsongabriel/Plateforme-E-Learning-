import { Schema, model, Document, Types } from 'mongoose';

export interface IModule extends Document {
  titre: string;
  url: string;
  description?: string;
  duree?: number;
  ordre: number;
  cours: Types.ObjectId;
  type: 'VIDEO' | 'DOCUMENT' | 'QUIZ' | 'EXERCICE';
  dateCreation: Date;
}

const moduleSchema = new Schema<IModule>(
  {
    titre: { type: String, required: [true, 'Le titre du module est requis'], trim: true },
    url: { type: String, required: [true, "L'URL du contenu est requise"], trim: true },
    description: { type: String, trim: true },
    duree: { type: Number, min: [0, 'La durée doit être positive'] },
    ordre: { type: Number, required: [true, 'L’ordre du module est requis'], min: [1, 'L’ordre doit être supérieur à 0'] },
    cours: { type: Schema.Types.ObjectId, ref: 'Cours', required: [true, 'Le cours est requis'] },
    type: { 
      type: String, 
      required: [true, 'Le type du module est requis'], 
      enum: {
        values: ['VIDEO', 'DOCUMENT', 'QUIZ', 'EXERCICE'],
        message: '{VALUE} n\'est pas un type valide'
      }
    },
    dateCreation: { type: Date, default: Date.now, required: true },
  },
  { timestamps: { createdAt: 'dateCreation', updatedAt: false } }
);

export default model<IModule>('Module', moduleSchema);