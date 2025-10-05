// src/models/learning/Inscription.ts
import { Schema, model, Document, Types, Model } from 'mongoose';
import { StatutInscription } from '../../models/enums/StatutInscription'; // Adjust path as needed

// Interface pour le document Inscription
export interface IInscription extends Document {
  apprenant: Types.ObjectId;
  cours: Types.ObjectId;
  dateInscription: Date;
  statut: StatutInscription;
}

// Schéma pour Inscription
const inscriptionSchema = new Schema<IInscription>({
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
  dateInscription: {
    type: Date,
    default: Date.now,
  },
  statut: {
    type: String,
    enum: Object.values(StatutInscription),
    default: StatutInscription.EN_COURS,
  },
});

// Index unique pour éviter doublons
inscriptionSchema.index({ apprenant: 1, cours: 1 }, { unique: true });

// Modèle Inscription
const Inscription: Model<IInscription> = model<IInscription>('Inscription', inscriptionSchema);

export default Inscription;