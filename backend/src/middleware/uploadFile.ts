import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger';

// === CONFIGURATION DES DOSSIERS UPLOADS ===
const uploadBaseDir = path.join(__dirname, '../../uploads');
const uploadDirs = {
  videos: path.join(uploadBaseDir, 'videos'),
  documents: path.join(uploadBaseDir, 'documents'),
  images: path.join(uploadBaseDir, 'images'),
  temp: path.join(uploadBaseDir, 'temp'),
};

// Créer tous les dossiers nécessaires
Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`Dossier créé: ${dir}`);
  }
});

// === DÉTECTION DU TYPE DE FICHIER ===
const getFileCategory = (mimetype: string): keyof typeof uploadDirs => {
  if (mimetype.startsWith('video/')) return 'videos';
  if (mimetype.startsWith('image/')) return 'images';
  if (mimetype.startsWith('application/') || mimetype.startsWith('text/')) return 'documents';
  return 'documents';
};

// === STOCKAGE MULTER DYNAMIQUE ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = getFileCategory(file.mimetype);
    cb(null, uploadDirs[category]);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const safeName = nameWithoutExt
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
    
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const uniqueName = `${safeName}-${timestamp}-${randomStr}${ext}`;
    
    cb(null, uniqueName);
  },
});

// === FILTRE DE TYPE DE FICHIER ===
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = {
    video: {
      extensions: ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'],
      mimes: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'],
    },
    document: {
      extensions: ['.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx', '.xls', '.xlsx'],
      mimes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
    },
    image: {
      extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
      mimes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    },
  };

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  const isValid = Object.values(allowedTypes).some(
    type => type.extensions.includes(ext) && type.mimes.includes(mime)
  );

  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error(
      `Type de fichier non autorisé: ${ext} (${mime}). ` +
      `Formats acceptés: Vidéos (MP4, WebM, MOV, etc.), Documents (PDF, DOCX, TXT, etc.), Images (JPG, PNG, GIF, etc.)`
    ));
  }
};

// === MULTER INSTANCE ===
const upload = multer({
  storage,
  limits: { 
    fileSize: 200 * 1024 * 1024, // 200 Mo
    files: 1,
  },
  fileFilter,
});

// === MIDDLEWARE D'UPLOAD PRINCIPAL ===
export const uploadFile = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const uploader = upload.single('file');

  uploader(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      logger.error(`Erreur Multer: ${err.code}`, { message: err.message });
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          errors: [{ 
            type: 'upload', 
            field: 'file',
            msg: 'Fichier trop volumineux. Taille maximale: 200 Mo' 
          }],
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          errors: [{ 
            type: 'upload', 
            field: 'file',
            msg: 'Champ "file" manquant ou nom de champ incorrect' 
          }],
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          errors: [{ 
            type: 'upload', 
            field: 'file',
            msg: 'Un seul fichier autorisé à la fois' 
          }],
        });
      }
      
      return res.status(400).json({
        success: false,
        errors: [{ 
          type: 'upload', 
          field: 'file',
          msg: `Erreur d'upload: ${err.message}` 
        }],
      });
    }
    
    if (err) {
      logger.error(`Erreur d'upload`, { error: err.message, stack: err.stack });
      return res.status(400).json({
        success: false,
        errors: [{ 
          type: 'upload', 
          field: 'file',
          msg: err.message || 'Erreur lors de l\'upload du fichier' 
        }],
      });
    }
    
    next();
  });
};

// === MIDDLEWARE D'UPLOAD MULTIPLE ===
export const uploadMultipleFiles = (maxFiles: number = 5) => {
  const uploaderMultiple = upload.array('files', maxFiles);
  
  return (req: Request, res: Response, next: NextFunction) => {
    uploaderMultiple(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        logger.error(`Erreur Multer (multiple): ${err.code}`);
        
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            errors: [{ 
              type: 'upload', 
              msg: 'Un ou plusieurs fichiers sont trop volumineux (max 200 Mo chacun)' 
            }],
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            errors: [{ 
              type: 'upload', 
              msg: `Nombre maximum de fichiers dépassé (max ${maxFiles})` 
            }],
          });
        }
      }
      
      if (err) {
        logger.error(`Erreur d'upload multiple`, { error: err.message });
        return res.status(400).json({
          success: false,
          errors: [{ type: 'upload', msg: err.message }],
        });
      }
      
      next();
    });
  };
};

// === UTILITAIRE: SUPPRIMER UN FICHIER ===
export const deleteFile = (filePath: string): boolean => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`Fichier supprimé: ${filePath}`);
      return true;
    }
    return false;
  } catch (err) {
    logger.error(`Erreur suppression fichier: ${filePath}`, { error: (err as Error).message });
    return false;
  }
};

// === UTILITAIRE: OBTENIR L'URL PUBLIQUE ===
export const getFileUrl = (req: Request, filename: string, category: string): string => {
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/uploads/${category}/${filename}`;
};