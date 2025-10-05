import { Schema, model, Document, Types, Model } from 'mongoose';

// Interface pour le document Quiz
interface IQuiz extends Document {
  titre: string;
  description?: string;
  cours: Types.ObjectId;
  questions: Types.ObjectId[];
  scoreMinValide: number;
  createdAt: Date;
  updatedAt: Date;
  corriger(reponsesUtilisateur: number[]): Promise<{ score: number; valide: boolean }>;
}

// Schéma pour Quiz
const quizSchema = new Schema<IQuiz>(
  {
    titre: { type: String, required: true },
    description: { type: String },
    cours: { type: Schema.Types.ObjectId, ref: 'Cours', required: true },
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    scoreMinValide: { type: Number, default: 70 }, // Pourcentage minimal pour validation
  },
  { timestamps: true }
);

// Méthode pour corriger un quiz
quizSchema.methods.corriger = async function (
  this: IQuiz,
  reponsesUtilisateur: number[]
): Promise<{ score: number; valide: boolean }> {
  const Question = model('Question');
  const questions = await Question.find({ _id: { $in: this.questions } });
  let score = 0;
  questions.forEach((q: any, index: number) => {
    if (q.reponseCorrecte === reponsesUtilisateur[index]) {
      score += 1;
    }
  });
  const pourcentage = (questions.length > 0 ? score / questions.length : 0) * 100;
  // Innovation: Si validé, déclencher un certificat si niveau approprié
  if (pourcentage >= this.scoreMinValide) {
    // Logique pour vérifier niveau et générer certificat (à connecter avec Certificat model)
  }
  return { score: pourcentage, valide: pourcentage >= this.scoreMinValide };
};

// Modèle Quiz
const Quiz: Model<IQuiz> = model<IQuiz>('Quiz', quizSchema);

export default Quiz;