const mongoose = require('mongoose');

const memeSchema = new mongoose.Schema({
  url: String,
  caption: String
});

module.exports = mongoose.model('Meme', memeSchema);
