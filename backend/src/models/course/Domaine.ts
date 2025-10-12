import { Schema, model, Document, Types, Model } from 'mongoose';

// Interface pour le document Domaine
interface IDomaine extends Document {
  nom: 'Informatique' | 'Communication' | 'Multimedia';
  description?: string;
  cours: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  ajouterCours(coursId: Types.ObjectId): Promise<IDomaine>;
  getStatistiques(): Promise<{ nombreCours: number; dureeTotale: number }>;
}

// Schéma pour Domaine
const domaineSchema = new Schema<IDomaine>(
  {
    nom: {
      type: String,
      required: true,
      enum: ['Informatique', 'Communication', 'Multimedia'],
      unique: true, // Ensure domain names are unique
    },
    description: { type: String },
    cours: [{ type: Schema.Types.ObjectId, ref: 'Cours' }],
  },
  { timestamps: true }
);

// Méthode pour ajouter un cours
domaineSchema.methods.ajouterCours = async function (
  this: IDomaine,
  coursId: Types.ObjectId
): Promise<IDomaine> {
  try {
    if (!this.cours.includes(coursId)) {
      this.cours.push(coursId);
      await this.save();
    }
    return this;
  } catch (err: unknown) {
    const error = err as Error;
    throw new Error(`Erreur lors de l'ajout du cours: ${error.message}`);
  }
};

// Méthode pour obtenir des statistiques par domaine
domaineSchema.methods.getStatistiques = async function (
  this: IDomaine
): Promise<{ nombreCours: number; dureeTotale: number }> {
  try {
    const Cours = model('Cours');
    const cours = await Cours.find({ domaineId: this._id });
    const totalDuree = cours.reduce((sum, c: any) => sum + (c.duree || 0), 0); // Use reduce for safer summation
    return {
      nombreCours: cours.length,
      dureeTotale: totalDuree,
    };
  } catch (err: unknown) {
    const error = err as Error;
    throw new Error(`Erreur lors du calcul des statistiques: ${error.message}`);
  }
};

// Add index for faster queries
domaineSchema.index({ nom: 1 });

// Modèle Domaine
const Domaine: Model<IDomaine> = model<IDomaine>('Domaine', domaineSchema);

export default Domaine;
