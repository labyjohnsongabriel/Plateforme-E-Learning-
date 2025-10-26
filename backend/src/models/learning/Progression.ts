// src/models/learning/Progression.ts
import { Schema, model, Document, Types, Model } from 'mongoose';
import { StatutProgression } from '../../services/learning/ProgressionService';
import { CourseDocument } from '../../types';

export interface IProgression extends Document {
  apprenant: Types.ObjectId;
  cours: Types.ObjectId | CourseDocument;
  pourcentage: number;
  dateDebut: Date;
  dateFin?: Date;
  statut: StatutProgression;
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
  dateDebut: {
    type: Date,
    required: true,
    default: Date.now,
  },
  dateFin: {
    type: Date,
    required: false,
  },
  statut: {
    type: String,
    enum: Object.values(StatutProgression),
    default: StatutProgression.EN_COURS,
  },
});

progressionSchema.index({ apprenant: 1, cours: 1 }, { unique: true });

const Progression: Model<IProgression> = model<IProgression>('Progression', progressionSchema);

export default Progression;
