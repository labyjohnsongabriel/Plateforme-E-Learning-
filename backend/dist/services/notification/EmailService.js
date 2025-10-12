"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyConnection = exports.sendNotification = void 0;
// src/services/notification/EmailService.ts
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("../../utils/logger"));
// Création du transporteur directement - CORRECTION: utiliser createTransport
const transporter = nodemailer_1.default.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
// Send email notification
const sendNotification = async (email, message) => {
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
        logger_1.default.info(`Email sent to ${email}`);
    }
    catch (err) {
        logger_1.default.error(`Email sending error: ${err.message}`);
        throw err;
    }
};
exports.sendNotification = sendNotification;
// Vérification optionnelle de la connexion
const verifyConnection = async () => {
    try {
        await transporter.verify();
        logger_1.default.info('✅ SMTP connection established');
    }
    catch (error) {
        logger_1.default.error('❌ SMTP connection failed:', error);
    }
};
exports.verifyConnection = verifyConnection;
//# sourceMappingURL=EmailService.js.map