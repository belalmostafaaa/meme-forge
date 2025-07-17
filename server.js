const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

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

http.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});

/* I added those emits for clarifying if there is any issues, it would be shown in the terminal */
