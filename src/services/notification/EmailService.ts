import { Transporter } from 'nodemailer';
import logger from '../utils/logger';
import { transporter } from '../config/email';

// Send email notification
export const sendNotification = async (email: string, message: string): Promise<void> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Notification de Youth Computing',
      text: message,
    });
    logger.info(`Email sent to ${email}`);
  } catch (err) {
    logger.error(`Email sending error: ${(err as Error).message}`);
    throw err;
  }
};