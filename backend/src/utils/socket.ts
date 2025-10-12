import { Server, Socket } from 'socket.io';
import http from 'http';

let io: Server | null = null;

export const init = (server: http.Server): Server => {
  io = new Server(server, {
    cors: {
      origin: '*', // Adjust based on frontend URL
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};