// models/course/Question.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IQuestion extends Document {
  type: 'CHOIX_MULTIPLE' | 'MULTIPLE_REPONSES' | 'VRAI_FAUX';
  question: string;
  options: string[];
  correctAnswers: number[];
  points: number;
  explanation?: string;
  timeLimit?: number;
  quiz: Types.ObjectId;
  ordre: number;
}

const questionSchema = new Schema<IQuestion>(
  {
    type: {
      type: String,
      enum: ['CHOIX_MULTIPLE', 'MULTIPLE_REPONSES', 'VRAI_FAUX'],
      required: true
    },
    question: { type: String, required: true },
    options: [{ type: String }],
    correctAnswers: [{ type: Number }],
    points: { type: Number, default: 1, min: 1 },
    explanation: { type: String },
    timeLimit: { type: Number, min: 0 },
    quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    ordre: { type: Number, required: true }
  },
  { timestamps: true }
);

export default model<IQuestion>('Question', questionSchema);