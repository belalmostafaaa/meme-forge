const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 8080;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Store the latest canvas state
let canvasState = null;

io.on('connection', (socket) => {
  console.log('A user connected');

  // Send the current canvas state to the new user
  if (canvasState) {
    socket.emit('canvas:update', canvasState);
  }

  // When receiving a canvas update from a user
  socket.on('canvas:update', (data) => {
    canvasState = data; // Save the latest version
    socket.broadcast.emit('canvas:update', data); // Send it to all other users
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
