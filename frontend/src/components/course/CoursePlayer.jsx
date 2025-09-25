// CoursePlayer.jsx - Lecteur cours avec fond immersif gradient
import React from 'react';
import VideoPlayer from './VideoPlayer';
import DocumentViewer from './DocumentViewer';
import QuizComponent from './QuizComponent';
import { colors } from '../styles/colors';

const CoursePlayer = ({ courseContent, theme = 'light' }) => {
  const bg = theme === 'dark' ? colors.backgroundDark : colors.backgroundLight;

  return (
    <div style={{
      background: bg,
      padding: '24px',
      minHeight: '100vh',
      color: theme === 'dark' ? colors.textDark : colors.textLight,
    }}>
      <h2>Lecteur de Cours</h2>
      {courseContent.type === 'video' && <VideoPlayer url={courseContent.url} />}
      {courseContent.type === 'document' && <DocumentViewer url={courseContent.url} />}
      {courseContent.type === 'quiz' && <QuizComponent questions={courseContent.questions} />}
    </div>
  );
};

export default CoursePlayer;