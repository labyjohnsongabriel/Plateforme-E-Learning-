import { Model, Document, Types } from 'mongoose';
interface IQuestion extends Document {
    texte: string;
    type: 'SINGLE' | 'MULTIPLE';
    options: string[];
    reponsesCorrectes: string[];
    quiz: Types.ObjectId;
}
declare const Question: Model<IQuestion>;
export default Question;
//# sourceMappingURL=Question.d.ts.map