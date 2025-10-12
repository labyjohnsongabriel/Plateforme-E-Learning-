// src/services/notification/EmailService.ts
import nodemailer from 'nodemailer';
import logger from '../../utils/logger';

// Création du transporteur directement - CORRECTION: utiliser createTransport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send email notification
export const sendNotification = async (email: string, message: string): Promise<void> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Notification de Youth Computing',
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Youth Computing</h2>
          <p>${message}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            Cet email a été envoyé automatiquement, merci de ne pas y répondre.
          </p>
        </div>
      `,
    });
    logger.info(`Email sent to ${email}`);
  } catch (err) {
    logger.error(`Email sending error: ${(err as Error).message}`);
    throw err;
  }
};

// Vérification optionnelle de la connexion
export const verifyConnection = async (): Promise<void> => {
  try {
    await transporter.verify();
    logger.info('✅ SMTP connection established');
  } catch (error) {
    logger.error('❌ SMTP connection failed:', error);
  }
};