import { Schema, model, Model, Document, Types } from 'mongoose';

interface IQuestion extends Document {
  texte: string;
  type: 'SINGLE' | 'MULTIPLE';
  options: string[];
  reponsesCorrectes: string[];
  quiz: Types.ObjectId;
}

const questionSchema = new Schema<IQuestion>(
  {
    texte: { type: String, required: true },
    type: {
      type: String,
      enum: ['SINGLE', 'MULTIPLE'],
      required: true,
    },
    options: [{ type: String, required: true }],
    reponsesCorrectes: [{ type: String, required: true }],
    quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true }, // ✅ corrigé ici
  },
  { timestamps: true }
);

const Question: Model<IQuestion> = model<IQuestion>('Question', questionSchema);

export default Question;
