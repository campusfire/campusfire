// définition du modèle des posts

const mongoose = require('mongoose');

const contentSchema = mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  type: {
    type: String,
    enum: ['TEXT', 'IMAGE', 'VIDEO', 'EMBEDED'],
    default: 'TEXT',
  },
  payload: String,
  createdOn: { type: Date, default: Date.now },
  lifetime: { type: Number, default: 40 },
  position: {
    x: Number,
    y: Number,
    z: Number,
  },
  display: { type: mongoose.Schema.Types.ObjectId, ref: 'Display' },
});

module.exports = mongoose.model('Content', contentSchema);
