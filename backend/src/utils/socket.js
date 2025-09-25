// src/utils/socket.js
const { Server } = require("socket.io");
const http = require("http");

let io;

module.exports = {
  init: (server) => {
    io = new Server(server, {
      cors: {
        origin: "*", // Adjust based on your frontend URL
        methods: ["GET", "POST"],
      },
    });
    io.on("connection", (socket) => {
      console.log(`User connected: ${socket.id}`);
      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });
    return io;
  },
  io: () => io,
};
