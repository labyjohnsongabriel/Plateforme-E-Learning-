import multer from 'multer';
import path from 'path';
import { Request } from 'express';

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    let folder = 'documents';
    if (file.mimetype.startsWith('video')) folder = 'videos';
    else if (file.mimetype.startsWith('image')) folder = 'images';
    cb(null, path.join(__dirname, '../../uploads', folder));
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });
export default upload;