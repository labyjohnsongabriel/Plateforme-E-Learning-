import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import http from 'http';
import { Server, Socket } from 'socket.io';
import config from './src/config/config'; // Corrigé pour pointer vers config.ts
import connect  from './src/config/database'; // Import nommé pour connect
import { init as initSocket } from './src/utils/socket';
import logger from './src/utils/logger';

// Import route modules
import courseRoutes from './src/routes/courses';
//import {notificationRoutes} from './src/routes/notifications'; // Assurez-vous que c'est un export par défaut
import apprenantRoutes from './src/routes/apprenant';
import authRoutes from './src/routes/auth';
import userRoutes from './src/routes/users';
import instructeurRoutes from './src/routes/instructeur';
import adminRoutes from './src/routes/admin';
import learningRoutes from './src/routes/learning';
import indexRoutes from './src/routes/index';
import statsRoutes from './src/routes/stats';

// Create Express app
const app: Express = express();
const server: http.Server = http.createServer(app);

// Apply CORS middleware
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use('/api/courses', courseRoutes);
//app.use('/api/notifications', notificationRoutes);
app.use('/api/apprenant', apprenantRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/instructeurs', instructeurRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/index', indexRoutes);
app.use('/api/stats', statsRoutes);

// Test route
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ message: 'Server is running correctly' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error: ${err.message}`);
  res.status((err as any).status || 500).json({ message: 'Server error', error: err.message });
});

// Initialize Socket.IO
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

// Start scheduled jobs
import './src/jobs/certificateJob';
import './src/jobs/notificationJob';
import './src/jobs/cleanupJob';

// Start server
const startServer = async (port: number): Promise<void> => {
  try {
    await connect();
    server.listen(port, () => {
      logger.info(`🚀 Server running on port ${port}`);
    });
  } catch (err: any) {
    if (err.code === 'EADDRINUSE') {
      logger.warn(`Port ${port} is in use, trying port ${port + 1}`);
      await startServer(port + 1);
    } else {
      logger.error(`❌ Server startup error: ${err.message}`);
      process.exit(1);
    }
  }
};

startServer(config.PORT);

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (err: Error) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (err: Error) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});