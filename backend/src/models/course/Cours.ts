// src/models/course/Cours.ts
import { Schema, model, Document, Types, Model } from 'mongoose';
import { ProgressionUpdateData } from '../../types';
import { NiveauFormation } from '../../services/learning/CertificationService';

// Interface pour le document Cours
export interface ICours extends Document {
  _id: Types.ObjectId;
  titre: string;
  description?: string;
  duree: number;
  domaineId: Types.ObjectId;
  niveau: NiveauFormation;
  createur: Types.ObjectId;
  etudiants: Types.ObjectId[]; 
  contenu: Types.ObjectId[];
  quizzes: Types.ObjectId[];
  datePublication?: Date;
  estPublie: boolean;
  statutApprobation: 'PENDING' | 'APPROVED' | 'REJECTED';
  progression?: number; 
  instructeurId?: Types.ObjectId; 
  dateCreation?: Date; 
  updatedAt: Date;
  createdAt: Date;
  ajouterContenu(contenuId: Types.ObjectId): Promise<ICours>;
  publier(): Promise<ICours>;
  calculerCompletionMoyenne(): Promise<number>;
  ajouterEtudiant(etudiantId: Types.ObjectId): Promise<ICours>; 
}

// Schéma pour Cours
const coursSchema = new Schema<ICours>(
  {
    titre: { 
      type: String, 
      required: [true, 'Le titre est requis'],
      trim: true,
      maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
    },
    description: { 
      type: String, 
      default: '',
      maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
    },
    duree: { 
      type: Number, 
      required: [true, 'La durée est requise'],
      min: [1, 'La durée doit être d\'au moins 1 heure']
    },
    domaineId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Domaine', 
      required: [true, 'Le domaine est requis'] 
    },
    niveau: {
      type: String,
      enum: Object.values(NiveauFormation),
      required: [true, 'Le niveau est requis'],
    },
    createur: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: [true, 'Le créateur est requis'] 
    },
    instructeurId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      default: null
    },
    etudiants: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      default: [] 
    }],
    contenu: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Contenu', 
      default: [] 
    }],
    quizzes: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Quiz', 
      default: [] 
    }],
    progression: { 
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    datePublication: { type: Date },
    estPublie: { 
      type: Boolean, 
      default: false 
    },
    statutApprobation: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index pour améliorer les performances
coursSchema.index({ domaineId: 1 });
coursSchema.index({ createur: 1 });
coursSchema.index({ etudiants: 1 }); // Index pour les requêtes my-courses
coursSchema.index({ estPublie: 1, statutApprobation: 1 });

// Virtual pour la date de création (alias de createdAt)
coursSchema.virtual('dateCreation').get(function(this: ICours) {
  return this.createdAt;
});

// Méthode pour ajouter du contenu
coursSchema.methods.ajouterContenu = async function (
  this: ICours,
  contenuId: Types.ObjectId
): Promise<ICours> {
  if (!this.contenu.includes(contenuId)) {
    this.contenu.push(contenuId);
    await this.save();
  }
  return this;
};

// Méthode pour ajouter un étudiant
coursSchema.methods.ajouterEtudiant = async function (
  this: ICours,
  etudiantId: Types.ObjectId
): Promise<ICours> {
  if (!this.etudiants.includes(etudiantId)) {
    this.etudiants.push(etudiantId);
    await this.save();
  }
  return this;
};

// Méthode pour publier le cours
coursSchema.methods.publier = async function (this: ICours): Promise<ICours> {
  this.estPublie = true;
  this.datePublication = new Date();
  this.statutApprobation = 'APPROVED';
  await this.save();

  // Création de notification (à adapter si tu as un modèle Notification)
  try {
    const Notification = model('Notification');
    await Notification.create({
      message: `Le cours "${this.titre}" est maintenant publié !`,
      type: 'RAPPEL_COURS',
      destinataires: this.etudiants, // Notifier les étudiants inscrits
    });
  } catch (err) {
    console.warn('Notification non créée :', (err as Error).message);
  }

  return this;
};

// Méthode pour calculer la complétion moyenne
coursSchema.methods.calculerCompletionMoyenne = async function (
  this: ICours
): Promise<number> {
  try {
    const Progression = model('Progression');
    const result = await Progression.aggregate([
      { $match: { cours: this._id } },
      { $group: { _id: null, moyenne: { $avg: '$pourcentage' } } },
    ]);
    return result.length > 0 ? Math.round(result[0].moyenne || 0) : 0;
  } catch (err) {
    console.error('Erreur calcul completion moyenne:', err);
    return 0;
  }
};

// Middleware pre-save pour s'assurer que l'instructeurId est défini
coursSchema.pre('save', function(next) {
  // Si instructeurId n'est pas défini, utiliser createur comme instructeur par défaut
  if (!this.instructeurId) {
    this.instructeurId = this.createur;
  }
  next();
});

// Static method pour trouver les cours d'un étudiant
coursSchema.statics.findByEtudiant = function(etudiantId: Types.ObjectId) {
  return this.find({ etudiants: etudiantId })
    .populate('domaineId')
    .populate('instructeurId', 'prenom nom email')
    .populate('createur', 'prenom nom');
};

// Modèle Cours
const Cours: Model<ICours> = model<ICours>('Cours', coursSchema);

export default Cours;