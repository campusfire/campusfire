const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const { makeId } = require('./routes/utils');

app.locals.displayId = '';
app.locals.clients = [];
app.locals.maxClients = 99;
app.set('io', io);

app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.json());

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

console.log(process.env[process.env.PORT]);
http.listen(process.env.PORT ? process.env[process.env.PORT] : 8080);
