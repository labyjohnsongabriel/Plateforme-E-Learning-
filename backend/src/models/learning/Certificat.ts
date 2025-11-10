// src/models/learning/Certificat.ts
import { Schema, model, Document, Types, Model } from 'mongoose';

// Interface pour le document Certificat
export interface ICertificat extends Document {
  _id: Types.ObjectId;
  apprenant: Types.ObjectId;
  cours: Types.ObjectId;
  dateEmission: Date;
  urlCertificat: string;
  valide: boolean;
  codeCertificat: string;
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
  valide: {
    type: Boolean,
    default: true,
  },
  codeCertificat: {
    type: String,
    required: true,
    unique: true,
  },
});

// Index pour accélérer les recherches
certificatSchema.index({ apprenant: 1, cours: 1 }, { unique: true });

// Modèle Certificat
const Certificat: Model<ICertificat> = model<ICertificat>('Certificat', certificatSchema);

export default Certificat;