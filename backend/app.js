// src/app.js (example)
const express = require("express");
const http = require("http");
const socket = require("../backend/src/utils/socket");
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
socket.init(server);

module.exports = server; // Export server instead of app
