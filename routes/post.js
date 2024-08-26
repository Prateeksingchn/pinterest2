const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board' },
  title: String,
  description: String,
  image: String
});



module.exports = mongoose.model('post', postSchema);
