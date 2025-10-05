import { Schema, model, Document, Types, Model } from 'mongoose';

// Interface pour le document Question
interface IQuestion extends Document {
  enonce: string;
  reponses: string[];
  reponseCorrecte: number;
  quiz: Types.ObjectId;
}

// Interface pour les méthodes statiques
interface IQuestionModel extends Model<IQuestion> {
  genererAleatoire(quizId: Types.ObjectId): Promise<IQuestion | null>;
}

// Schéma pour Question
const questionSchema = new Schema<IQuestion>({
  enonce: { type: String, required: true },
  reponses: [{ type: String, required: true }], // Liste des options
  reponseCorrecte: { type: Number, required: true }, // Index de la réponse correcte
  quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
});

// Méthode statique pour générer une question aléatoire
questionSchema.statics.genererAleatoire = async function (
  quizId: Types.ObjectId
): Promise<IQuestion | null> {
  const count = await this.countDocuments({ quiz: quizId });
  const random = Math.floor(Math.random() * count);
  return this.findOne({ quiz: quizId }).skip(random);
};

// Modèle Question
const Question: IQuestionModel = model<IQuestion, IQuestionModel>('Question', questionSchema);

export default Question;