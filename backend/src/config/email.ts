import nodemailer from 'nodemailer';
import logger from '../utils/logger';

// Configuration du transporteur email
export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Vérification de la connexion au démarrage
export const verifyEmailConnection = async (): Promise<void> => {
  try {
    await transporter.verify();
    logger.info('✅ Connexion SMTP établie avec succès');
  } catch (error) {
    logger.error('❌ Erreur de connexion SMTP:', error);
  }
};