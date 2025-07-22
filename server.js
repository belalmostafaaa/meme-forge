const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const Meme = require('./Models/Meme');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(express.static('public'));

const mongoURI = 'mongodb+srv://memeforge:<password>@cluster0.mongodb.net/memeforge?retryWrites=true&w=majority';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Submit new meme
app.post('/submit', async (req, res) => {
  const { url, caption, json } = req.body;
  try {
    const meme = new Meme({ url, caption, json, votes: 0 });
    await meme.save();
    io.emit('newMeme', meme); // Notify all clients
    res.status(200).send('Meme submitted!');
  } catch (err) {
    res.status(500).send('Failed to submit meme');
  }
});

// Get gallery memes
app.get('/gallery-data', async (req, res) => {
  try {
    const memes = await Meme.find();
    res.json(memes);
  } catch (err) {
    res.status(500).send('Error loading memes');
  }
});

// Socket.IO for real-time
io.on('connection', (socket) => {
  console.log('🟢 A user connected:', socket.id);

  socket.on('meme:join', (memeId) => {
    socket.join(memeId);
  });

  socket.on('meme:edit', async ({ id, json, caption }) => {
    try {
      const meme = await Meme.findById(id);
      if (meme) {
        meme.json = json;
        meme.caption = caption;
        await meme.save();
        socket.to(id).emit('meme:update', { json, caption });
      }
    } catch (err) {
      console.error('Failed to update meme:', err);
    }
  });

  socket.on('meme:vote', async (id) => {
    try {
      const meme = await Meme.findById(id);
      if (meme) {
        meme.votes += 1;
        await meme.save();
        io.emit('meme:vote:update', { id: meme._id, votes: meme.votes });
      }
    } catch (err) {
      console.error('Failed to vote on meme:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 A user disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
