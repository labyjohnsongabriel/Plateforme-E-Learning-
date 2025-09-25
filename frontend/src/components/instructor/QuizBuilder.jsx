// QuizBuilder.jsx - Constructeur de quiz
import React, { useState } from 'react';
import { colors } from '../styles/colors';

const QuizBuilder = ({ theme = 'light' }) => {
  const [questions, setQuestions] = useState([{ question: '', options: ['', ''], answer: '' }]);
  const bg = theme === 'dark' ? colors.backgroundDark : colors.backgroundLight;

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', ''], answer: '' }]);
  };

  const handleSave = () => {
    // Placeholder pour sauvegarde du quiz
    alert('Quiz sauvegardé.');
    // À implémenter : fetch('/api/instructor/quizzes', { method: 'POST' });
  };

  return (
    <div style={{
      background: bg,
      padding: '24px',
      borderRadius: '8px',
      maxWidth: '800px',
      margin: '16px 0',
      color: theme === 'dark' ? colors.textDark : colors.textLight,
    }}>
      <h3>Constructeur de Quiz</h3>
      {questions.map((q, index) => (
        <div key={index} style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Question"
            value={q.question}
            onChange={(e) => {
              const newQuestions = [...questions];
              newQuestions[index].question = e.target.value;
              setQuestions(newQuestions);
            }}
            style={{ width: '100%', padding: '8px', margin: '8px 0' }}
          />
          <input
            type="text"
            placeholder="Option 1"
            value={q.options[0]}
            onChange={(e) => {
              const newQuestions = [...questions];
              newQuestions[index].options[0] = e.target.value;
              setQuestions(newQuestions);
            }}
            style={{ width: '100%', padding: '8px', margin: '8px 0' }}
          />
          <input
            type="text"
            placeholder="Option 2"
            value={q.options[1]}
            onChange={(e) => {
              const newQuestions = [...questions];
              newQuestions[index].options[1] = e.target.value;
              setQuestions(newQuestions);
            }}
            style={{ width: '100%', padding: '8px', margin: '8px 0' }}
          />
          <input
            type="text"
            placeholder="Réponse correcte"
            value={q.answer}
            onChange={(e) => {
              const newQuestions = [...questions];
              newQuestions[index].answer = e.target.value;
              setQuestions(newQuestions);
            }}
            style={{ width: '100%', padding: '8px', margin: '8px 0' }}
          />
        </div>
      ))}
      <button onClick={handleAddQuestion} style={{ background: colors.accent, color: 'white', padding: '8px', margin: '8px 0' }}>
        Ajouter une question
      </button>
      <button onClick={handleSave} style={{ background: colors.success, color: 'white', padding: '10px' }}>
        Sauvegarder
      </button>
    </div>
  );
};

export default QuizBuilder;