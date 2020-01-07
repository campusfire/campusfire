const mongoose = require('mongoose');

const displaySchema = mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  name: String,
  token: String,
});

module.exports = mongoose.model('Display', displaySchema);
