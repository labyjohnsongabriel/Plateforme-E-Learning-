// models/course/Quiz.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IQuiz extends Document {
  titre: string;
  description?: string;
  questions: Types.ObjectId[];
  parametres: {
    showResults: boolean;
    allowRetry: boolean;
    randomizeQuestions: boolean;
    timeLimit: boolean;
    showProgress: boolean;
    passPercentage: number;
    maxAttempts: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const quizSchema = new Schema<IQuiz>(
  {
    titre: { type: String, required: true },
    description: { type: String },
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    parametres: {
      showResults: { type: Boolean, default: true },
      allowRetry: { type: Boolean, default: false },
      randomizeQuestions: { type: Boolean, default: false },
      timeLimit: { type: Boolean, default: true },
      showProgress: { type: Boolean, default: true },
      passPercentage: { type: Number, default: 70, min: 0, max: 100 },
      maxAttempts: { type: Number, default: 3, min: 1 }
    }
  },
  { timestamps: true }
);

export default model<IQuiz>('Quiz', quizSchema);