import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger';

// === CONFIG DOSSIERS ===
const uploadsDir = path.join(__dirname, '../../uploads');
const videosDir = path.join(uploadsDir, 'videos');
const documentsDir = path.join(uploadsDir, 'documents');

// ✅ Création des dossiers
[uploadsDir, videosDir, documentsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`📁 Dossier créé: ${dir}`);
  }
});

// ✅ Fonction de normalisation (gardez votre version actuelle)
function normalizeFilename(originalName: string): string {
  if (!originalName) return `file_${Date.now()}.bin`;
  
  const ext = path.extname(originalName).toLowerCase();
  let baseName = path.basename(originalName, ext);

  baseName = baseName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s\-.]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80)
    .toLowerCase();

  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  
  return `${baseName}_${timestamp}_${randomStr}${ext}`;
}

// ✅ Configuration Multer améliorée avec destination dynamique
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Détermine le dossier en fonction du type MIME
    if (file.mimetype.startsWith('video/')) {
      cb(null, videosDir);
    } else if (file.mimetype === 'application/pdf') {
      cb(null, documentsDir);
    } else {
      cb(null, uploadsDir); // Dossier par défaut
    }
  },
  filename: (req, file, cb) => {
    try {
      const safeName = normalizeFilename(file.originalname);
      logger.info(`📁 Upload: ${file.originalname} → ${safeName}`);
      cb(null, safeName);
    } catch (error) {
      logger.error('Erreur normalisation', error);
      const fallbackName = `file_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${path.extname(file.originalname)}`;
      cb(null, fallbackName);
    }
  },
});

// ✅ Filtre de fichiers amélioré
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    // Vidéos
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 
    'video/x-msvideo', 'video/x-matroska',
    // Documents
    'application/pdf',
    // Images
    'image/jpeg', 'image/png', 'image/gif',
    // Textes
    'text/plain'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    logger.warn(`Type de fichier non autorisé: ${file.mimetype}`);
    cb(new Error(`Type de fichier non autorisé: ${file.mimetype}. Types autorisés: ${allowedTypes.join(', ')}`));
  }
};

const upload = multer({ 
  storage, 
  limits: { 
    fileSize: 500 * 1024 * 1024, // 500MB
    files: 1 
  }, 
  fileFilter 
});

const router = Router();

// === CORS MIDDLEWARE ===
router.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

// ✅ Fonction de recherche améliorée pour tous les dossiers
function findFile(filename: string): string | null {
  const decodedFilename = decodeURIComponent(filename);
  
  console.log(`🔍 Recherche: "${filename}" -> "${decodedFilename}"`);

  // Recherche dans tous les dossiers d'upload
  const searchDirs = [videosDir, documentsDir, uploadsDir];
  
  for (const searchDir of searchDirs) {
    if (!fs.existsSync(searchDir)) {
      console.warn(`❌ Dossier n'existe pas: ${searchDir}`);
      continue;
    }

    try {
      const files = fs.readdirSync(searchDir);
      
      // Recherche exacte
      const exactMatch = files.find(file => {
        const fileWithoutExt = path.basename(file, path.extname(file));
        const searchWithoutExt = path.basename(decodedFilename, path.extname(decodedFilename));
        
        return (
          file === decodedFilename || 
          file === filename ||
          file.toLowerCase() === decodedFilename.toLowerCase() ||
          file.toLowerCase() === filename.toLowerCase() ||
          fileWithoutExt.toLowerCase() === searchWithoutExt.toLowerCase()
        );
      });

      if (exactMatch) {
        console.log(`✅ Match exact trouvé dans ${searchDir}: ${exactMatch}`);
        return path.join(searchDir, exactMatch);
      }
    } catch (error) {
      console.error(`❌ Erreur recherche dans ${searchDir}`, error);
    }
  }

  console.warn(`❌ Aucun match pour: ${decodedFilename}`);
  return null;
}

// ✅ Route de service des fichiers
router.use('/uploads', (req: Request, res: Response, next: NextFunction) => {
  const filename = req.path.substring(1);
  
  if (!filename) {
    logger.warn('Nom de fichier vide dans /uploads');
    return res.status(400).json({ error: 'Nom de fichier requis' });
  }

  logger.info(`🔍 Accès fichier: ${filename}`);

  const filePath = findFile(filename);
  
  if (filePath && fs.existsSync(filePath)) {
    logger.info(`✅ Fichier trouvé: ${path.basename(filePath)}`);
    return serveFile(filePath, res);
  }

  logger.warn(`❌ Fichier non trouvé: ${filename}`);
  res.status(404).json({ 
    error: 'Fichier non trouvé sur le serveur',
    filename
  });
});

// ✅ Types MIME étendus
const mimeTypes: Record<string, string> = {
  // Vidéos
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.mkv': 'video/x-matroska',
  // Documents
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Images
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
};

// ✅ Fonction de service de fichier (gardez votre version actuelle)
function serveFile(filePath: string, res: Response): void {
  try {
    const resolvedPath = path.resolve(filePath);
    
    // Vérification de sécurité
    const allowedDirs = [videosDir, documentsDir, uploadsDir].map(dir => path.resolve(dir));
    if (!allowedDirs.some(dir => resolvedPath.startsWith(dir))) {
      logger.error(`❌ Accès refusé: ${resolvedPath}`);
      return void res.status(403).json({ error: 'Accès refusé' });
    }

    if (!fs.existsSync(resolvedPath)) {
      logger.error(`❌ Fichier non trouvé: ${resolvedPath}`);
      return void res.status(404).json({ error: 'Fichier non trouvé' });
    }

    const stats = fs.statSync(resolvedPath);
    if (!stats.isFile()) {
      logger.error(`❌ Chemin est un dossier: ${resolvedPath}`);
      return void res.status(400).json({ error: 'Le chemin spécifié est un dossier' });
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const mime = mimeTypes[ext] || 'application/octet-stream';

    logger.info(`📤 Service fichier: ${path.basename(resolvedPath)} (${stats.size} bytes)`);

    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Length', stats.size.toString());
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Content-Disposition', 'inline');

    const stream = fs.createReadStream(resolvedPath);
    
    stream.on('error', (err) => {
      logger.error('❌ Erreur stream fichier', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erreur lecture fichier' });
      }
    });
    
    stream.pipe(res);
  } catch (error) {
    logger.error('❌ Erreur service fichier', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erreur interne serveur' });
    }
  }
}

// ✅ Route d'upload (identique à votre version actuelle)
router.post('/', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false, 
      error: 'Aucun fichier uploadé ou type non autorisé' 
    });
  }

  const fileUrl = `http://localhost:3001/uploads/${req.file.filename}`;
  
  logger.info('✅ Upload réussi', {
    original: req.file.originalname,
    saved: req.file.filename,
    size: req.file.size,
    url: fileUrl
  });

  res.json({
    success: true,
    message: 'Upload réussi',
    file: {
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: fileUrl,
      path: `/uploads/${req.file.filename}`,
    },
  });
});

// Gardez vos autres routes (check, search, debug) telles quelles...

export default router;