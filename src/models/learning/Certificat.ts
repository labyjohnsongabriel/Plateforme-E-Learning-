// src/models/learning/Certificat.ts
import { Schema, model, Document, Types, Model } from 'mongoose';

// Interface pour le document Certificat
export interface ICertificat extends Document {
  apprenant: Types.ObjectId;
  cours: Types.ObjectId;
  dateEmission: Date;
  urlCertificat: string;
}

// Schéma pour Certificat
const certificatSchema = new Schema<ICertificat>({
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
  dateEmission: {
    type: Date,
    default: Date.now,
  },
  urlCertificat: {
    type: String,
    required: true,
  },
});

// Index pour accélérer les recherches par apprenant et cours (évite les doublons et optimise les queries)
certificatSchema.index({ apprenant: 1, cours: 1 }, { unique: true });

// Modèle Certificat
const Certificat: Model<ICertificat> = model<ICertificat>('Certificat', certificatSchema);

export default Certificat;