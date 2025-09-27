// Reports.jsx - Rapports
import React, { useState, useEffect } from 'react';
import { colors } from "../../utils/colors";

const Reports = ({ theme = 'light' }) => {
  const [reports, setReports] = useState([]);
  const bg = theme === 'dark' ? colors.globalGradientDark : colors.globalGradientLight;

  useEffect(() => {
    // Appel API pour récupérer les rapports
    fetch('/api/admin/reports')
      .then(res => res.json())
      .then(data => setReports(data));
  }, []);

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '32px', color: theme === 'dark' ? colors.textDark : colors.textLight }}>
      <h1>Rapports</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {reports.map(report => (
          <li key={report.id} style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>
            {report.title} <button style={{ background: colors.success, color: 'white', padding: '4px' }}>Télécharger</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reports;