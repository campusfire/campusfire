require('dotenv').config();

const mongoose = require('mongoose');
const Display = require('./models/display');

mongoose.connect(process.env.MONGO, { useNewUrlParser: true });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  const display = new Display({ name: 'Campus Fire', token: 'fire' });
  display.save();
  console.log('ok');
});
