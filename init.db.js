require('dotenv').config();

const mongoose = require('mongoose');
const Display = require('./models/display');
const Content = require('./models/content');

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async () => {
  await Display.remove({});
  await Content.remove({});

  const display = new Display({ name: 'Campus Fire', token: 'fire' });
  await display.save();

  const content1 = new Content({
    type: 'TEXT',
    payload: 'Coucou campus',
    position: { x: 20, y: 20, z: 1 },
    // eslint-disable-next-line no-underscore-dangle
    display: display._id,
  });
  await content1.save();

  console.log('ok');
});
