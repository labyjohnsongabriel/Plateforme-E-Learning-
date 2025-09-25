// About.jsx - Page à propos
import React from 'react';
//import { colors } from '../../styles/colors';

const About = ({ theme = 'light' }) => {
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '32px', color: theme === 'dark' ? colors.textDark : colors.textLight }}>
      <h1>À propos de nous</h1>
      <p>Youth Computing est dédié à renforcer l'accès à la formation numérique pour tous.</p>
    </div>
  );
};

export default About;