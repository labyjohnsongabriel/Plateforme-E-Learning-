// Certificates.jsx - Mes certificats
import React, { useState, useEffect } from 'react';
//import { colors } from '../../styles/colors';

const Certificates = ({ userId, theme = 'light' }) => {
  const [certificates, setCertificates] = useState([]);
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  useEffect(() => {
    // Appel API pour récupérer les certificats
    fetch(`/api/users/${userId}/certificates`)
      .then(res => res.json())
      .then(data => setCertificates(data));
  }, [userId]);

  const handleDownload = (certId) => {
    // Placeholder pour téléchargement
    alert(`Téléchargement du certificat ${certId} initié.`);
    // À implémenter : fetch(`/api/certificates/${certId}/download`);
  };

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '32px', color: theme === 'dark' ? colors.textDark : colors.textLight }}>
      <h1>Mes Certificats</h1>
      {certificates.length === 0 ? (
        <p>Aucun certificat obtenu pour le moment.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {certificates.map(cert => (
            <li key={cert.id} style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>
              Certificat - Niveau {cert.level}
              <button onClick={() => handleDownload(cert.id)} style={{ background: colors.success, color: 'white', padding: '4px', marginLeft: '10px' }}>Télécharger</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Certificates;