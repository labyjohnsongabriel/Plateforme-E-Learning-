const cron = require("node-cron");
const Progression = require("../models/learning/Progression");
const NotificationService = require("../services/notification/NotificationService");
const dateUtils = require("../utils/dateUtils");
const constants = require("../utils/constants");
const logger = require("../utils/logger");

// Weekly job for inactivity reminders
cron.schedule("0 0 * * 0", async () => {
  try {
    const inactive = await Progression.find({ dateFin: { $exists: false } });
    for (const prog of inactive) {
      if (
        dateUtils.isOlderThanDays(
          prog.updatedAt,
          constants.INACTIVITY_DAYS_FOR_REMINDER
        )
      ) {
        await NotificationService.create({
          utilisateur: prog.apprenant,
          message:
            "Rappel : Continuez votre progression dans le cours pour obtenir votre certificat !",
          type: "rappel_cours",
        });
      }
    }
    logger.info("Notification job completed");
  } catch (err) {
    logger.error(`Notification job error: ${err.message}`);
  }
});
