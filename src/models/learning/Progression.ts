// src/models/learning/Progression.ts
import { Schema, model, Document, Types, Model } from 'mongoose';

export interface IProgression extends Document {
  apprenant: Types.ObjectId;
  cours: Types.ObjectId;
  pourcentage: number;
  dateFin?: Date;
  // autres champs si nécessaires
}

const progressionSchema = new Schema<IProgression>({
  apprenant: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cours: {
    type: Schema.Types.ObjectId,
    ref: 'Cours',
    required: true,
  },
  pourcentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  dateFin: {
    type: Date,
    required: false,
  },
});

progressionSchema.index({ apprenant: 1, cours: 1 }, { unique: true });

const Progression: Model<IProgression> = model<IProgression>('Progression', progressionSchema);

export default Progression;