const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(express.static('public'));

const memes = [];

// Routes
app.post('/submit', (req, res) => {
  const { url, caption } = req.body;
  const newMeme = {
    id: Date.now().toString(),
    url,
    caption,
    votes: 0
  };
  memes.push(newMeme);
  io.emit('newMeme', newMeme); // Notify all clients
  res.status(200).send('Meme submitted!');
});

app.get('/gallery-data', (req, res) => {
  res.json(memes);
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('meme:join', (memeId) => {
    socket.join(memeId);
  });

  socket.on('meme:request', (memeId) => {
    const meme = memes.find(m => m.id === memeId);
    if (meme) {
      socket.emit('meme:data', meme);
    }
  });

  socket.on('meme:edit', ({ id, json, caption }) => {
    const meme = memes.find(m => m.id === id);
    if (meme) {
      meme.json = json;
      meme.caption = caption;
      socket.to(id).emit('meme:update', { json, caption });
    }
  });

  socket.on('meme:vote', (id) => {
    const meme = memes.find(m => m.id === id);
    if (meme) {
      meme.votes += 1;
      io.emit('meme:vote:update', { id: meme.id, votes: meme.votes });
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); //tttt
