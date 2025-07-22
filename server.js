const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Socket.IO for real-time updates
let canvasData = null; // Shared canvas state

io.on('connection', (socket) => {
  console.log('A user connected');

  // Send current canvas state to new user
  if (canvasData) {
    socket.emit('canvas:update', canvasData);
  }

  socket.on('canvas:update', (data) => {
    canvasData = data;
    socket.broadcast.emit('canvas:update', data);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 8080; 
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
