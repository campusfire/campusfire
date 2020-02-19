const express = require('express');
const path = require('path');

const winston = require('winston');
const expressWinston = require('express-winston');
require('dotenv').config();

const mongoose = require('mongoose');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const { makeId } = require('./routes/utils');

io.eio.pingTimeout = 60000;

app.locals.displayId = '';
app.locals.clients = [];
app.locals.maxClients = 99;
app.set('io', io);

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.json());

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(),
  ],
  format: winston.format.combine(
    winston.format.json(),
  ),
});

app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console(),
  ],
  format: winston.format.combine(
    winston.format.json(),
  ),
  meta: false,
  msg: 'HTTP {{req.method}} {{req.url}}',
  expressFormat: true,
  colorize: false,
}));

mongoose.connect(process.env.MONGO, { useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  logger.info('Connected to database');
});

const displayRoutes = require('./routes/display');
const mobileRoutes = require('./routes/mobile');
require('./routes/socket')(app, io);

app.use(displayRoutes);
app.use(mobileRoutes);

const clientKey = makeId(8); // last client key
app.locals.clients.push({ clientKey, clientId: null });

app.get('/ping', (req, res) => res.send('pong'));

app.get('/key', (req, res) => {
  res.send(clientKey);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


logger.info(process.env[process.env.PORT]);
const listener = http.listen(process.env.PORT ? process.env[process.env.PORT] : 8080, () => {
  console.log(`Listening on port ${listener.address().port}`);
});
