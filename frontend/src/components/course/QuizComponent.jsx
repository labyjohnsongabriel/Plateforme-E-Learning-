// QuizComponent.jsx - Composant quiz avec fond interactif gradient
import React, { useState } from 'react';
import { colors } from '../styles/colors';

const QuizComponent = ({ questions, onSubmit, theme = 'light' }) => {
  const [answers, setAnswers] = useState({});
  const bg = theme === 'dark' ? colors.backgroundDark : colors.backgroundLight;

  const handleChange = (qId, value) => {
    setAnswers({ ...answers, [qId]: value });
  };

  const handleSubmit = () => {
    onSubmit(answers); // Appel pour vérification et certification
  };

  return (
    <div style={{
      background: bg,
      padding: '24px',
      borderRadius: '8px',
      maxWidth: '600px',
      margin: 'auto',
      color: theme === 'dark' ? colors.textDark : colors.textLight,
    }}>
      <h2>Quiz</h2>
      {questions.map((q, index) => (
        <div key={index}>
          <p>{q.question}</p>
          {q.options.map(opt => (
            <label key={opt}>
              <input type="radio" name={`q${index}`} onChange={() => handleChange(index, opt)} />
              {opt}
            </label>
          ))}
        </div>
      ))}
      <button onClick={handleSubmit} style={{ background: colors.accent, color: 'white', padding: '10px' }}>
        Soumettre
      </button>
    </div>
  );
};

export default QuizComponent;