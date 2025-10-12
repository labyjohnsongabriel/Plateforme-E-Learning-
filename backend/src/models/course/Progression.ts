import { Schema, model, Model, Types } from 'mongoose';
import { ProgressionDocument } from '../../types';

const progressionSchema = new Schema<ProgressionDocument>(
  {
    apprenant: { type: Types.ObjectId, ref: 'User', required: true },
    cours: { type: Types.ObjectId, ref: 'Cours', required: true },
    pourcentage: { type: Number, required: true, min: 0, max: 100 },
    avancement: { type: Number, required: true, default: 0 },
    dateDebut: { type: Date, required: true, default: Date.now },
    dateFin: { type: Date },
  },
  { timestamps: true }
);

const Progression: Model<ProgressionDocument> = model<ProgressionDocument>('Progression', progressionSchema);

export default Progression;