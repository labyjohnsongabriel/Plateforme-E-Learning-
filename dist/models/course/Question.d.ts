import { Document, Types, Model } from 'mongoose';
interface IQuestion extends Document {
    enonce: string;
    reponses: string[];
    reponseCorrecte: number;
    quiz: Types.ObjectId;
}
interface IQuestionModel extends Model<IQuestion> {
    genererAleatoire(quizId: Types.ObjectId): Promise<IQuestion | null>;
}
declare const Question: IQuestionModel;
export default Question;
//# sourceMappingURL=Question.d.ts.map