"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.init = void 0;
const socket_io_1 = require("socket.io");
let io = null;
const init = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: '*', // Adjust based on frontend URL
            methods: ['GET', 'POST'],
        },
    });
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
    return io;
};
exports.init = init;
const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
};
exports.getIO = getIO;
//# sourceMappingURL=socket.js.map