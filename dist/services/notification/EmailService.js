"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const email_1 = require("../config/email");
// Send email notification
const sendNotification = async (email, message) => {
    try {
        await email_1.transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Notification de Youth Computing',
            text: message,
        });
        logger_1.default.info(`Email sent to ${email}`);
    }
    catch (err) {
        logger_1.default.error(`Email sending error: ${err.message}`);
        throw err;
    }
};
exports.sendNotification = sendNotification;
//# sourceMappingURL=EmailService.js.map