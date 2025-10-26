import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import http from 'http';
import { Server, Socket } from 'socket.io';
import logger from './src/utils/logger';

import config from './src/config/config';
import connect from './src/config/database';
import { init as initSocket } from './src/utils/socket';
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

const app: Express = express();
const server: http.Server = http.createServer(app);

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(express.json());

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

app.get('/api/test', (req: Request, res: Response) => {
  res.json({ message: '✅ Server is running correctly' });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`❌ Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    headers: req.headers,
  });
  res.status((err as any).status || 500).json({
    errors: [{
      type: 'server',
      msg: err.message || 'Erreur serveur interne',
      path: '',
      location: 'server',
    }],
  });
});

const io: Server = initSocket(server);

io.on('connection', (socket: Socket) => {
  logger.info(`🔗 User connected: ${socket.id}`);

  socket.on('join', (userId: string) => {
    socket.join(userId);
    logger.info(`👥 User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    logger.info(`❌ User disconnected: ${socket.id}`);
  });
});

import './src/jobs/certificateJob';
import './src/jobs/notificationJob';
import './src/jobs/cleanupJob';

const startServer = async (port: number): Promise<void> => {
  try {
    await connect();
    server.listen(port, () => {
      logger.info(`🚀 Server running on port ${port}`);
      logger.info(`🔑 JWT_SECRET = ${process.env.JWT_SECRET ? '✅ défini' : '❌ non défini'}`);
      logger.info(`📦 Mongo URI = ${process.env.MONGODB_URI}`);
    });
  } catch (err: any) {
    if (err.code === 'EADDRINUSE') {
      logger.warn(`⚠️ Port ${port} is in use, trying port ${port + 1}`);
      await startServer(port + 1);
    } else {
      logger.error(`❌ Server startup error: ${err.message}`, { stack: err.stack });
      process.exit(1);
    }
  }
};

startServer(config.PORT || 3001);

process.on('uncaughtException', (err: Error) => {
  logger.error(`💥 Uncaught Exception: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (err: any) => {
  logger.error(`⚠️ Unhandled Rejection: ${err?.message || err}`, { stack: err?.stack });
  process.exit(1);
});