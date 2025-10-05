// src/models/learning/Document.ts (supposé)
import { Schema } from 'mongoose';
import Contenu, { IContenu, IDocument } from './Contenu';

// Schéma pour le discriminateur Document
const contenuDocumentSchema = new Schema<IDocument>({
  urlDocument: { type: String, required: true },
  type: { type: String, enum: ['pdf', 'doc', 'other'] },
});

// Discriminateur pour Document
export default Contenu.discriminator<IDocument>('document', contenuDocumentSchema);