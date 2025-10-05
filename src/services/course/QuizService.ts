import Quiz, { IQuiz } from '../../models/course/Quiz';

// Interface for quiz creation data
interface QuizData {
  [key: string]: any; // Flexible to accommodate various fields
}

// Create a new quiz
export const create = async (data: QuizData): Promise<IQuiz> => {
  const quiz = new Quiz(data);
  await quiz.save();
  return quiz;
};