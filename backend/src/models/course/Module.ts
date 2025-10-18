import { Schema, model, Document, Types } from 'mongoose';

export interface IModule extends Document {
  titre: string;
  contenu?: string;
  ordre: number;
  coursId: Types.ObjectId;
  dateCreation: Date;
}

const moduleSchema = new Schema<IModule>(
  {
    titre: { type: String, required: [true, 'Le titre du module est requis'], trim: true },
    contenu: { type: String, trim: true },
    ordre: { type: Number, required: [true, 'L’ordre du module est requis'], min: [1, 'L’ordre doit être supérieur à 0'] },
    coursId: { type: Schema.Types.ObjectId, ref: 'Cours', required: [true, 'Le cours est requis'] },
    dateCreation: { type: Date, default: Date.now, required: true },
  },
  { timestamps: { createdAt: 'dateCreation', updatedAt: false } }
);

export default model<IModule>('Module', moduleSchema);