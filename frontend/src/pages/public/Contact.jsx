// Contact.jsx - Page contact
import React from 'react';
//import { colors } from '../../styles/colors';

const Contact = ({ theme = 'light' }) => {
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '32px', color: theme === 'dark' ? colors.textDark : colors.textLight }}>
      <h1>Contactez-nous</h1>
      <p>Email: contact@youthcomputing.org</p>
    </div>
  );
};

export default Contact;