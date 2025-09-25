// DocumentViewer.jsx - Visionneuse document avec fond gradient clair
import React from 'react';
import { colors } from '../styles/colors';

const DocumentViewer = ({ url, theme = 'light' }) => {
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  return (
    <div style={{
      background: bg,
      padding: '16px',
      borderRadius: '8px',
      maxWidth: '800px',
      margin: 'auto',
      height: '600px',
      overflow: 'auto',
    }}>
      <iframe src={url} style={{ width: '100%', height: '100%', border: 'none' }} title="Document Viewer" />
    </div>
  );
};

export default DocumentViewer;