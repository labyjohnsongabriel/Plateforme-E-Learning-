// routes/quizRoutes.ts
import { Router } from 'express';
import QuizController from '../controllers/QuizController';
import authMiddleware from '../middleware/auth';

const router = Router();

router.post('/quizzes', authMiddleware, QuizController.createQuiz);
router.get('/quizzes', authMiddleware, QuizController.getAllQuizzes);
router.get('/quizzes/:id', authMiddleware, QuizController.getQuiz);
router.post('/quizzes/:id/submit', authMiddleware, QuizController.submitQuiz);
router.put('/quizzes/:id', authMiddleware, QuizController.updateQuiz);
router.delete('/quizzes/:id', authMiddleware, QuizController.deleteQuiz);
router.get('/quizzes/:id/results', authMiddleware, QuizController.getQuizResults);

export default router;