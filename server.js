const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const path = require('path');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

const memes = [];

app.get('/gallery-data', (req, res) => {
  res.json(memes.map(({ id, caption, image, votes }) => ({ id, caption, image, votes })));
});

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

  socket.on('canvas:update', (data) => {
    socket.broadcast.emit('canvas:update', data);
  });

  socket.on('meme:submit', ({ json, caption, image }) => {
    const newMeme = {
      id: Date.now().toString(),
      json,
      caption,
      image,
      votes: 0
    };
    memes.push(newMeme);
    console.log('Meme submitted:', newMeme.id);
  });

  socket.on('meme:vote', (id) => {
    const meme = memes.find(m => m.id === id);
    if (meme) {
      meme.votes += 1;
      io.emit('meme:vote:update', { id: meme.id, votes: meme.votes });
    }
  });
});

const PORT = process.env.PORT || 8080;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
