const transporter = require("../../config/email");
const logger = require("../../utils/logger");

exports.sendNotification = async (email, message) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Notification de Youth Computing",
      text: message,
    });
    logger.info(`Email sent to ${email}`);
  } catch (err) {
    logger.error(`Email sending error: ${err.message}`);
  }
};
