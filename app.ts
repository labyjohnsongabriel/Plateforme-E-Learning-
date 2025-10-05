import express, { Express } from 'express';
import http from 'http';
import { init as initSocket } from './utils/socket';

const app: Express = express();
const server: http.Server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

export default server;