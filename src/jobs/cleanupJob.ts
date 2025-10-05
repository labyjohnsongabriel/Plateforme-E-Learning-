// src/jobs/fileCleanupJob.ts
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import * as dateUtils from '../utils/dateUtils';
import * as constants from '../utils/constants';
import logger from '../utils/logger';

// Monthly cleanup of old uploaded files
cron.schedule('0 0 1 * *', () => {
  const folders: string[] = ['videos', 'documents', 'images', 'certificates'];
  folders.forEach((folder: string) => {
    const dir: string = path.join(__dirname, '../../uploads', folder);
    if (!fs.existsSync(dir)) return;
    fs.readdir(dir, (err: NodeJS.ErrnoException | null, files: string[]) => {
      if (err) return logger.error(`Cleanup error: ${err.message}`);
      files.forEach((file: string) => {
        const filePath: string = path.join(dir, file);
        fs.stat(filePath, (err: NodeJS.ErrnoException | null, stat: fs.Stats) => {
          if (err) return;
          if (
            dateUtils.isOlderThanDays(stat.mtime, constants.FILE_CLEANUP_DAYS)
          ) {
            fs.unlink(filePath, (err: NodeJS.ErrnoException | null) => {
              if (err) logger.error(`File delete error: ${err.message}`);
              else logger.info(`Cleaned up file: ${filePath}`);
            });
          }
        });
      });
    });
  });
});

