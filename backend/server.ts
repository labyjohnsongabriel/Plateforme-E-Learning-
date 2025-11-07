import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { Server, Socket } from 'socket.io';
import logger from './src/utils/logger';

import config from './src/config/config';
import connect from './src/config/database';
import { init as initSocket } from './src/utils/socket';

// === ROUTES ===
import apprenantRoutes from './src/routes/apprenant';
import courseRoutes from './src/routes/courses';
import notificationRoutes from './src/routes/notifications';
import moduleRoutes from './src/routes/modules';
import authRoutes from './src/routes/auth';
import userRoutes from './src/routes/users';
import instructeurRoutes from './src/routes/instructeur';
import adminRoutes from './src/routes/admin';
import learningRoutes from './src/routes/learning';
import indexRoutes from './src/routes/index';
import statsRoutes from './src/routes/stats';
import uploadRoutes from './src/routes/upload';

const app: Express = express();
const server: http.Server = http.createServer(app);

// === CONFIGURATION DU DOSSIER UPLOADS ===
const uploadsDir = path.join(__dirname, 'uploads');
const videosDir = path.join(uploadsDir, 'videos');
const documentsDir = path.join(uploadsDir, 'documents');
const imagesDir = path.join(uploadsDir, 'images');

// Créer tous les dossiers nécessaires
const directories = [uploadsDir, videosDir, documentsDir, imagesDir];
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`📁 Dossier créé: ${dir}`);
  }
});

// === MIDDLEWARES ===
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// === FONCTION DE RECHERCHE DE FICHIERS POUR LE SERVAGE STATIQUE ===
function findFileForStatic(filename: string): string | null {
  const categories = ['videos', 'documents', 'images', ''];
  const decodedFilename = decodeURIComponent(filename);
  
  for (const category of categories) {
    const categoryPath = category ? path.join(uploadsDir, category) : uploadsDir;
    if (!fs.existsSync(categoryPath)) continue;
    
    const files = fs.readdirSync(categoryPath);
    
    // Recherche exacte
    const exactMatch = files.find(file => 
      file.toLowerCase() === decodedFilename.toLowerCase() ||
      file === decodedFilename
    );
    
    if (exactMatch) {
      return path.join(categoryPath, exactMatch);
    }
    
    // Recherche fuzzy
    const searchBase = decodedFilename
      .toLowerCase()
      .replace(/\.[^/.]+$/, "")
      .replace(/_\d+_[a-z0-9]+$/, "")
      .replace(/[_-]/g, '')
      .replace(/\s+/g, '');
    
    for (const file of files) {
      const fileBase = file
        .toLowerCase()
        .replace(/\.[^/.]+$/, "")
        .replace(/_\d+_[a-z0-9]+$/, "")
        .replace(/[_-]/g, '')
        .replace(/\s+/g, '');
      
      if (fileBase.includes(searchBase) || searchBase.includes(fileBase)) {
        return path.join(categoryPath, file);
      }
    }
  }
  
  return null;
}

// === SERVIR LES FICHIERS STATIQUES - VERSION AMÉLIORÉE ===
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.ogg': 'video/ogg',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.mkv': 'video/x-matroska',
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };

    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);

    if (mimeType.startsWith('video/')) {
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  },
  
  // Fallback personnalisé pour la recherche de fichiers
  fallthrough: true
}));

// === MIDDLEWARE FALLBACK POUR LES FICHIERS NON TROUVÉS ===
app.use('/uploads', (req: Request, res: Response, next: NextFunction) => {
  // Si la requête est déjà traitée (fichier trouvé), passer au suivant
  if (res.headersSent) return next();
  
  const filename = req.path.substring(1);
  if (!filename) return next();
  
  logger.info(`🔍 Fallback - Recherche fichier: ${filename}`);
  
  const foundPath = findFileForStatic(filename);
  if (!foundPath) {
    logger.warn(`❌ Fichier non trouvé (fallback): ${filename}`);
    return res.status(404).json({ 
      error: 'Fichier non trouvé',
      filename: filename,
      message: 'Le fichier spécifié n\'existe pas sur le serveur'
    });
  }
  
  // Servir le fichier trouvé
  serveFileDirect(foundPath, req, res);
});

// === FONCTION POUR SERVIR LES FICHIERS DIRECTEMENT ===
function serveFileDirect(filePath: string, req: Request, res: Response): void {
  try {
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadsDir = path.resolve(uploadsDir);
    
    if (!resolvedPath.startsWith(resolvedUploadsDir)) {
      res.status(403).json({ error: 'Accès refusé' });
      return;
    }

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Fichier inaccessible' });
      return;
    }

    const stats = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.mkv': 'video/x-matroska',
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };

    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Gestion du streaming vidéo
    if (mimeType.startsWith('video/')) {
      const range = req.headers.range;
      
      if (range) {
        const videoSize = stats.size;
        const CHUNK_SIZE = 10 ** 6;
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
        const contentLength = end - start + 1;
        
        const headers = {
          "Content-Range": `bytes ${start}-${end}/${videoSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": contentLength,
          "Content-Type": mimeType,
        };
        
        res.writeHead(206, headers);
        const videoStream = fs.createReadStream(filePath, { start, end });
        videoStream.pipe(res);
        return;
      }

      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    } else {
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }

    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (error) => {
      logger.error('Erreur lecture fichier', { error: error.message, filePath });
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erreur lors de la lecture du fichier' });
      }
    });
    fileStream.pipe(res);

  } catch (error) {
    logger.error('Erreur service fichier direct', { 
      error: (error as Error).message, 
      filePath 
    });
    
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }
}

// === ROUTE DE SANTÉ ===
app.get('/health', (req: Request, res: Response) => {
  const uploadsStatus = {
    exists: fs.existsSync(uploadsDir),
    totalFiles: 0,
    structure: {} as any
  };

  // Compter les fichiers dans chaque dossier
  const categories = ['', 'videos', 'documents', 'images'];
  categories.forEach(category => {
    const categoryPath = category ? path.join(uploadsDir, category) : uploadsDir;
    if (fs.existsSync(categoryPath)) {
      const files = fs.readdirSync(categoryPath).filter(f => !f.startsWith('.'));
      uploadsStatus.structure[category || 'root'] = {
        path: categoryPath,
        fileCount: files.length,
        files: files.slice(0, 5) // Premier 5 fichiers
      };
      uploadsStatus.totalFiles += files.length;
    }
  });

  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uploads: uploadsStatus,
    baseUrl: `${req.protocol}://${req.get('host')}`,
    environment: process.env.NODE_ENV || 'development'
  });
});

// === ROUTE DE DIAGNOSTIC DES FICHIERS ===
app.get('/debug/files', (req: Request, res: Response) => {
  try {
    const files: any[] = [];
    const categories = ['', 'videos', 'documents', 'images'];
    
    categories.forEach(category => {
      const categoryPath = category ? path.join(uploadsDir, category) : uploadsDir;
      if (!fs.existsSync(categoryPath)) return;
      
      const categoryFiles = fs.readdirSync(categoryPath);
      categoryFiles.forEach(filename => {
        if (filename.startsWith('.')) return;
        
        const filePath = path.join(categoryPath, filename);
        try {
          const stats = fs.statSync(filePath);
          if (!stats.isFile()) return;

          const ext = path.extname(filename).toLowerCase();
          const mimeTypes: { [key: string]: string } = {
            '.mp4': 'video/mp4',
            '.webm': 'video/webm',
            '.mov': 'video/quicktime',
            '.avi': 'video/x-msvideo',
            '.mkv': 'video/x-matroska',
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
          };

          files.push({
            filename,
            category: category || 'root',
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            mimetype: mimeTypes[ext] || 'application/octet-stream',
            extension: ext,
            url: `/uploads/${encodeURIComponent(filename)}`,
            fullUrl: `${req.protocol}://${req.get('host')}/uploads/${encodeURIComponent(filename)}`,
            accessible: true,
            path: filePath
          });
        } catch (error) {
          files.push({
            filename,
            category: category || 'root',
            error: 'Cannot access file',
            accessible: false
          });
        }
      });
    });

    res.json({
      success: true,
      uploadsDir: uploadsDir,
      absolutePath: path.resolve(uploadsDir),
      files,
      total: files.length,
      categories: {
        root: fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir).filter(f => !f.startsWith('.')).length : 0,
        videos: fs.existsSync(videosDir) ? fs.readdirSync(videosDir).filter(f => !f.startsWith('.')).length : 0,
        documents: fs.existsSync(documentsDir) ? fs.readdirSync(documentsDir).filter(f => !f.startsWith('.')).length : 0,
        images: fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir).filter(f => !f.startsWith('.')).length : 0
      }
    });
  } catch (error) {
    logger.error('Erreur diagnostic fichiers', { error });
    res.status(500).json({
      success: false,
      error: 'Erreur lors du diagnostic'
    });
  }
});

// === ROUTES API ===
app.use('/api/courses', courseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/apprenant', apprenantRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/instructeurs', instructeurRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/index', indexRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/upload', uploadRoutes);

// === ROUTE DE TEST ===
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ 
    message: 'Server is running correctly',
    uploads: {
      directory: uploadsDir,
      absolutePath: path.resolve(uploadsDir),
      exists: fs.existsSync(uploadsDir),
      fileCount: fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir).filter(f => !f.startsWith('.')).length : 0
    },
    timestamp: new Date().toISOString(),
    baseUrl: `${req.protocol}://${req.get('host')}`
  });
});

// === ROUTE POUR VÉRIFIER LA DISPONIBILITÉ D'UN FICHIER ===
app.get('/api/files/check/:filename', (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    if (!filename) {
      return res.status(400).json({ 
        exists: false, 
        error: 'Nom de fichier requis' 
      });
    }

    const foundPath = findFileForStatic(filename);
    if (!foundPath) {
      return res.json({ 
        exists: false, 
        error: 'Fichier non trouvé sur le serveur',
        filename: filename
      });
    }

    const stats = fs.statSync(foundPath);
    const ext = path.extname(foundPath).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.mkv': 'video/x-matroska',
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };

    // Déterminer la catégorie
    let category = 'root';
    if (foundPath.startsWith(videosDir)) category = 'videos';
    else if (foundPath.startsWith(documentsDir)) category = 'documents';
    else if (foundPath.startsWith(imagesDir)) category = 'images';

    res.json({
      exists: true,
      filename: path.basename(foundPath),
      originalFilename: filename,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      mimetype: mimeTypes[ext] || 'application/octet-stream',
      category: category,
      url: `/uploads/${encodeURIComponent(filename)}`,
      fullUrl: `${req.protocol}://${req.get('host')}/uploads/${encodeURIComponent(filename)}`
    });
  } catch (error) {
    logger.error('Erreur vérification fichier', { 
      error: (error as Error).message, 
      filename: req.params.filename 
    });
    
    res.status(500).json({
      exists: false,
      error: 'Erreur lors de la vérification du fichier'
    });
  }
});

// === GESTIONNAIRE D'ERREURS GLOBAL ===
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof require('multer').MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        errors: [{ type: 'upload', msg: 'Fichier trop volumineux (max 200 Mo)' }],
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        errors: [{ type: 'upload', msg: 'Champ de fichier invalide' }],
      });
    }
  }

  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const status = err.status || 500;
  res.status(status).json({
    errors: [{
      type: 'server',
      msg: err.message || 'Erreur serveur interne',
      path: req.path,
    }],
  });
});

// === SOCKET.IO ===
const io: Server = initSocket(server);

io.on('connection', (socket: Socket) => {
  logger.info(`User connected: ${socket.id}`);

  socket.on('join', (userId: string) => {
    socket.join(userId);
    logger.info(`User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// === JOBS ===
import './src/jobs/certificateJob';
import './src/jobs/notificationJob';
import './src/jobs/cleanupJob';

// === DÉMARRAGE DU SERVEUR ===
const startServer = async (port: number): Promise<void> => {
  try {
    await connect();
    server.listen(port, () => {
      logger.info(`🚀 Server running on http://localhost:${port}`);
      logger.info(`📁 Uploads directory: ${uploadsDir}`);
      logger.info(`📁 Uploads absolute path: ${path.resolve(uploadsDir)}`);
      
      // Log de la structure des dossiers
      const categories = ['', 'videos', 'documents', 'images'];
      categories.forEach(category => {
        const categoryPath = category ? path.join(uploadsDir, category) : uploadsDir;
        if (fs.existsSync(categoryPath)) {
          const files = fs.readdirSync(categoryPath).filter(f => !f.startsWith('.'));
          logger.info(`📂 ${category || 'root'}: ${files.length} fichiers`);
          if (files.length > 0) {
            logger.info(`📝 Premiers fichiers dans ${category || 'root'}:`, files.slice(0, 3));
          }
        }
      });
      
      logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📊 Health check: http://localhost:${port}/health`);
      logger.info(`🔍 File debug: http://localhost:${port}/debug/files`);
      logger.info(`🔍 File check API: http://localhost:${port}/api/files/check/{filename}`);
    });
  } catch (err: any) {
    if (err.code === 'EADDRINUSE') {
      logger.warn(`Port ${port} occupé, tentative sur ${port + 1}...`);
      await startServer(port + 1);
    } else {
      logger.error(`Erreur démarrage: ${err.message}`, { stack: err.stack });
      process.exit(1);
    }
  }
};

startServer(config.PORT || 3001);

// === GESTION DES ERREURS GLOBALES ===
process.on('uncaughtException', (err: Error) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (err: any) => {
  logger.error(`Unhandled Rejection: ${err?.message || err}`, { stack: err?.stack });
  process.exit(1);
});