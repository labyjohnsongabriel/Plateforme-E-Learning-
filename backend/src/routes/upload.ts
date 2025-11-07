import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger';

// === CONFIG DOSSIERS ===
const uploadsDir = path.join(__dirname, '../../uploads');
const videosDir = path.join(uploadsDir, 'videos');

// ✅ CORRECTION: Création sécurisée des dossiers
[uploadsDir, videosDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`📁 Dossier créé: ${dir}`);
  }
});

// ✅ CORRECTION: Normalisation simplifiée mais efficace
function normalizeFilename(originalName: string): string {
  if (!originalName) return `file_${Date.now()}.mp4`;
  
  const ext = path.extname(originalName).toLowerCase();
  let baseName = path.basename(originalName, ext);

  // Normalisation basique mais efficace
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

// ✅ CORRECTION AMÉLIORÉE: Fonction de recherche de fichier
function findFile(filename: string): string | null {
  const decodedFilename = decodeURIComponent(filename);
  
  console.log(`🔍 Recherche: "${filename}" -> "${decodedFilename}"`);

  if (!fs.existsSync(videosDir)) {
    console.warn(`❌ Dossier videos n'existe pas: ${videosDir}`);
    return null;
  }

  try {
    const files = fs.readdirSync(videosDir);
    console.log(`📁 Contenu du dossier videos: ${files.length} fichiers`, files);
    
    if (files.length === 0) {
      console.warn('❌ Aucun fichier dans le dossier videos');
      return null;
    }

    // 1. Recherche exacte (avec et sans décodage)
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
      console.log(`✅ Match exact trouvé: ${exactMatch}`);
      return path.join(videosDir, exactMatch);
    }

    // 2. Recherche par similarité (sans les caractères spéciaux et espaces)
    const normalizedSearch = decodedFilename
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/\s+/g, '');

    console.log(`🔍 Recherche normalisée: "${normalizedSearch}"`);

    for (const file of files) {
      const normalizedFile = file
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .replace(/\s+/g, '');

      if (normalizedFile.includes(normalizedSearch) || normalizedSearch.includes(normalizedFile)) {
        console.log(`✅ Match similaire trouvé: ${file}`);
        return path.join(videosDir, file);
      }
    }

    // 3. Recherche par mots-clés
    const searchKeywords = decodedFilename
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(word => word.length > 2);

    console.log(`🔍 Mots-clés de recherche:`, searchKeywords);

    for (const file of files) {
      const fileLower = file.toLowerCase();
      const matches = searchKeywords.filter(keyword => fileLower.includes(keyword));
      
      if (matches.length >= Math.max(1, searchKeywords.length - 1)) {
        console.log(`✅ Match par mots-clés trouvé: ${file} (${matches.length}/${searchKeywords.length} mots)`);
        return path.join(videosDir, file);
      }
    }

    console.warn(`❌ Aucun match pour: ${decodedFilename}`);
    console.log(`📋 Fichiers disponibles: ${files.join(', ')}`);
    return null;

  } catch (error) {
    console.error('❌ Erreur recherche fichiers', error);
    return null;
  }
}

// ✅ Types MIME
const mimeTypes: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.mkv': 'video/x-matroska',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

// ✅ Configuration Multer simplifiée
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videosDir);
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

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 
    'video/x-msvideo', 'video/x-matroska'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    logger.warn(`Type de fichier non autorisé: ${file.mimetype}`);
    cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`));
  }
};

const upload = multer({ 
  storage, 
  limits: { 
    fileSize: 500 * 1024 * 1024,
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

// ✅ CORRECTION CRITIQUE: Route de service des fichiers SIMPLIFIÉE
router.use('/uploads', (req: Request, res: Response, next: NextFunction) => {
  const filename = req.path.substring(1); // Ne pas décoder ici
  
  if (!filename) {
    logger.warn('Nom de fichier vide dans /uploads');
    return res.status(400).json({ error: 'Nom de fichier requis' });
  }

  logger.info(`🔍 Accès fichier: ${filename}`);

  // Recherche directe
  const filePath = findFile(filename);
  
  if (filePath && fs.existsSync(filePath)) {
    logger.info(`✅ Fichier trouvé: ${path.basename(filePath)}`);
    return serveFile(filePath, res);
  }

  // 404 final
  logger.warn(`❌ Fichier non trouvé: ${filename}`);
  res.status(404).json({ 
    error: 'Fichier non trouvé sur le serveur',
    filename,
    searchedPath: videosDir
  });
});

// ✅ CORRECTION: Fonction de service de fichier avec vérifications
function serveFile(filePath: string, res: Response): void {
  try {
    const resolvedPath = path.resolve(filePath);
    
    // Vérification de sécurité
    if (!resolvedPath.startsWith(path.resolve(videosDir))) {
      logger.error(`❌ Accès refusé: ${resolvedPath}`);
      return void res.status(403).json({ error: 'Accès refusé' });
    }

    if (!fs.existsSync(resolvedPath)) {
      logger.error(`❌ Fichier non trouvé: ${resolvedPath}`);
      return void res.status(404).json({ error: 'Fichier non trouvé' });
    }

    // Vérifier que c'est un fichier
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

// ✅ Route d'upload
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

// ✅ CORRECTION: Route de vérification SIMPLIFIÉE
router.get('/check/:filename', (req: Request, res: Response) => {
  const filename = req.params.filename;
  if (!filename) {
    return res.status(400).json({ exists: false, error: 'Nom de fichier requis' });
  }

  logger.info(`🔍 Vérification fichier: ${filename}`);

  const filePath = findFile(filename);
  
  if (filePath && fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mime = mimeTypes[ext] || 'application/octet-stream';

    logger.info(`✅ Fichier vérifié: ${path.basename(filePath)}`);

    res.json({
      exists: true,
      filename: path.basename(filePath),
      size: stats.size,
      mimetype: mime,
      url: `http://localhost:3001/uploads/${path.basename(filePath)}`,
      path: filePath
    });
  } else {
    logger.warn(`❌ Fichier non trouvé: ${filename}`);
    res.json({ 
      exists: false, 
      error: 'Fichier non trouvé'
    });
  }
});

// ✅ CORRECTION: Route de recherche avancée avec vérification de type
router.get('/search/:filename', (req: Request, res: Response) => {
  const filename = req.params.filename;
  if (!filename) {
    return res.status(400).json({ error: 'Nom de fichier requis' });
  }

  console.log(`🔍 Recherche avancée: ${filename}`);

  try {
    const files = fs.existsSync(videosDir) ? fs.readdirSync(videosDir) : [];
    const decodedSearch = decodeURIComponent(filename).toLowerCase();
    
    // Recherche avec différents niveaux de tolérance
    const matches = files.filter(file => {
      const fileLower = file.toLowerCase();
      
      // 1. Match exact
      if (fileLower === decodedSearch) return true;
      
      // 2. Match partiel
      if (fileLower.includes(decodedSearch) || decodedSearch.includes(fileLower)) return true;
      
      // 3. Match sans extension
      const fileWithoutExt = path.basename(file, path.extname(file)).toLowerCase();
      const searchWithoutExt = path.basename(decodedSearch, path.extname(decodedSearch));
      if (fileWithoutExt === searchWithoutExt) return true;
      
      // 4. Match par mots-clés
      const searchWords = decodedSearch.split(/[^a-z0-9]+/).filter(w => w.length > 2);
      const fileWords = fileLower.split(/[^a-z0-9]+/).filter(w => w.length > 2);
      
      const commonWords = searchWords.filter(word => 
        fileWords.some(fileWord => fileWord.includes(word) || word.includes(fileWord))
      );
      
      return commonWords.length >= Math.max(1, searchWords.length - 1);
    });

    if (matches.length > 0) {
      const bestMatch = matches[0];
      
      // ✅ CORRECTION: Vérification que bestMatch n'est pas undefined
      if (bestMatch) {
        const filePath = path.join(videosDir, bestMatch);
        const stats = fs.statSync(filePath);
        
        console.log(`✅ Recherche avancée - Fichier trouvé: ${bestMatch}`);
        
        res.json({
          found: true,
          matches: matches,
          bestMatch: {
            filename: bestMatch,
            url: `http://localhost:3001/uploads/${bestMatch}`,
            size: stats.size,
            path: filePath
          }
        });
      } else {
        // ✅ CORRECTION: Gestion du cas où bestMatch serait undefined
        console.warn(`❌ bestMatch est undefined pour: ${filename}`);
        res.json({
          found: false,
          availableFiles: files.slice(0, 10)
        });
      }
    } else {
      console.warn(`❌ Recherche avancée - Aucun match pour: ${filename}`);
      res.json({
        found: false,
        availableFiles: files.slice(0, 10) // Retourne les 10 premiers fichiers disponibles
      });
    }
  } catch (error) {
    console.error('❌ Erreur recherche avancée', error);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
});

// ✅ NOUVELLE ROUTE: Debug ultra-simple
router.get('/debug', (req: Request, res: Response) => {
  try {
    const files = fs.existsSync(videosDir) ? fs.readdirSync(videosDir) : [];
    const filesInfo = files.map(file => {
      const filePath = path.join(videosDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        isFile: stats.isFile(),
        modified: stats.mtime
      };
    });

    res.json({
      videosDir,
      exists: fs.existsSync(videosDir),
      fileCount: files.length,
      files: filesInfo
    });
  } catch (error) {
    logger.error('Erreur debug', error);
    res.status(500).json({ error: 'Erreur lecture fichiers' });
  }
});

export default router;