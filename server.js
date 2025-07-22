const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs');
const path = require('path');

// Serve static files from 'public'
app.use(express.static(path.join(__dirname, 'public')));

const memesFilePath = path.join(__dirname, 'memes.json');

// Load memes from file
let memes = [];
try {
  const data = fs.readFileSync(memesFilePath, 'utf8');
  memes = JSON.parse(data);
} catch (err) {
  console.error('Failed to load memes.json:', err.message);
}

// GET: Gallery Data
app.get('/gallery-data', (req, res) => {
  res.json(memes.map(({ id, caption, image, votes }) => ({ id, caption, image, votes })));
});

// Helper to save memes to file
function saveMemesToFile() {
  fs.writeFile(memesFilePath, JSON.stringify(memes, null, 2), (err) => {
    if (err) console.error('Error saving memes:', err.message);
  });
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('meme:join', (memeId) => {
    socket.join(memeId);
  });

  socket.on('meme:request', (memeId) => {
    const meme = memes.find(m => m.id === memeId);
    if (meme) socket.emit('meme:data', meme);
  });

  socket.on('meme:edit', ({ id, json, caption }) => {
    const meme = memes.find(m => m.id === id);
    if (meme) {
      meme.json = json;
      meme.caption = caption;
      saveMemesToFile();
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
    saveMemesToFile();
    console.log('Meme submitted:', newMeme.id);
  });

  socket.on('meme:vote', (id) => {
    const meme = memes.find(m => m.id === id);
    if (meme) {
      meme.votes += 1;
      saveMemesToFile();
      io.emit('meme:vote:update', { id: meme.id, votes: meme.votes });
    }
  });
});

// Start server
const PORT = process.env.PORT || 8080;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
