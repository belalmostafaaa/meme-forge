const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public'))); // public folder contains index.html, client.js

let currentCanvasState = null;

io.on('connection', (socket) => {
  console.log(' A user connected');

  if (currentCanvasState) {
    socket.emit('canvas:update', currentCanvasState);
  }

  socket.on('canvas:update', (data) => {
    currentCanvasState = data;
    socket.broadcast.emit('canvas:update', data);
  });

  socket.on('disconnect', () => {
    console.log(' A user disconnected');
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(` Server listening on http://localhost:${PORT}`);
});
