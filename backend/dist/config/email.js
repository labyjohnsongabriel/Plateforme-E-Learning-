"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailConnection = exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("../utils/logger"));
// Configuration du transporteur email
exports.transporter = nodemailer_1.default.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
// Vérification de la connexion au démarrage
const verifyEmailConnection = async () => {
    try {
        await exports.transporter.verify();
        logger_1.default.info('✅ Connexion SMTP établie avec succès');
    }
    catch (error) {
        logger_1.default.error('❌ Erreur de connexion SMTP:', error);
    }
};
exports.verifyEmailConnection = verifyEmailConnection;
//# sourceMappingURL=email.js.map