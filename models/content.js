const mongoose = require('mongoose');

const contentSchema = mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  type: {
    type: String,
    enum: ['TEXT', 'IMAGE'],
    default: 'TEXT',
  },
  payload: String,
  createdOn: { type: Date, default: Date.now },
  position: {
    x: Number,
    y: Number,
  },
  display: { type: mongoose.Schema.Types.ObjectId, ref: 'Display' },
});

module.exports = mongoose.model('Content', contentSchema);
