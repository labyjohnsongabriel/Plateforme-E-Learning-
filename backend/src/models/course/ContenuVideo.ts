// src/models/learning/Video.ts
import { Schema } from 'mongoose';
import Contenu, { IVideo } from './Contenu';

// Schéma pour le discriminateur Vidéo
const contenuVideoSchema = new Schema<IVideo>({
  urlVideo: { type: String, required: true },
  duree: { type: Number, required: false },
});

// Discriminateur pour Vidéo
export default Contenu.discriminator<IVideo>('Video', contenuVideoSchema);