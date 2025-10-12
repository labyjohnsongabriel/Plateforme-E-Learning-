// src/jobs/inactivityReminderJob.ts
import cron from 'node-cron';
import Progression  from '../models/learning/Progression';
import * as NotificationService from '../services/notification/NotificationService';
import * as dateUtils from '../utils/dateUtils';
import * as constants from '../utils/constants';
import logger from '../utils/logger';

interface ProgressionDocument {
  dateFin?: Date;
  updatedAt: Date;
  apprenant: string;
  [key: string]: any; // For other fields in the Progression model
}

// Weekly job for inactivity reminders
cron.schedule('0 0 * * 0', async () => {
  try {
    const inactive: ProgressionDocument[] = await Progression.find({ 
      dateFin: { $exists: false } 
    });
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
            'Rappel : Continuez votre progression dans le cours pour obtenir votre certificat !',
          type: 'rappel_cours',
        });
      }
    }
    logger.info('Notification job completed');
  } catch (err: unknown) {
    const error = err as Error;
    logger.error(`Notification job error: ${error.message}`);
  }
});