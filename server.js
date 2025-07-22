const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const Meme = require('./Models/Meme');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const path = require('path');

app.use(express.json());
app.use(express.static('public'));

const mongoURI = 'mongodb+srv://memeforge:<password>@cluster0.mongodb.net/memeforge?retryWrites=true&w=majority';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(' Connected to MongoDB Atlas'))
  .catch(err => console.error(' MongoDB connection error:', err));

// Routes
app.post('/submit', async (req, res) => {
  const { url, caption } = req.body;
  try {
    const meme = new Meme({ url, caption });
    await meme.save();
    io.emit('newMeme', meme);
    res.status(200).send('Meme submitted!');
  } catch (err) {
    res.status(500).send('Failed to submit meme');
  }
});

app.get('/gallery-data', async (req, res) => {
  try {
    const memes = await Meme.find();
    res.json(memes);
  } catch (err) {
    res.status(500).send('Error loading memes');
  }
});

io.on('connection', (socket) => {
  console.log(' A user connected');
  socket.on('disconnect', () => {
    console.log(' A user disconnected');
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
