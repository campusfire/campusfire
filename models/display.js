const mongoose = require('mongoose');

const displaySchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  token: String,
});

module.exports = mongoose.model('Display', displaySchema);
