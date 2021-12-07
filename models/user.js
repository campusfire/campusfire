const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  user_key: { type: String, default: null },
  nb_like: { type: Number, default: 0 },
  nb_dislike: { type: Number, default: 0 },
  nb_post: { type: Number, default: 0 },
  connectedOn: { type: Date, default: Date.now },
  disconnectedOn: { type: Date, default: null },
  display: { type: mongoose.Schema.Types.ObjectId, ref: 'Display' },
});

module.exports = mongoose.model('User', userSchema);
