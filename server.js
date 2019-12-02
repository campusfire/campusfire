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
app.set('io', io);

app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.json());


function findKey(id) {
  for (let i = 0, len = app.locals.clients.length; i < len; i += 1) {
    const c = app.locals.clients[i];

    if (c.clientId === id) {
      return c.clientKey;
    }
  }
  return null;
}

const displayRoutes = require('./routes/display');
const mobileRoutes = require('./routes/mobile');

app.use(displayRoutes);
app.use(mobileRoutes);


function deleteId(clientKey) { // sera utile pour déconnecter les users
  for (let i = 0, len = app.locals.clients.length; i < len; i += 1) {
    const c = app.locals.clients[i];

    if (c.clientKey === clientKey) {
      app.locals.clients.splice(i, 1);
      break;
    }
  }
}

let clientKey = makeId(8); // last client key
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

io.on('connection', (socket) => {
  console.log(`Socket ${socket.id} connected`);
  for (let i = 0, len = app.locals.clients.length; i < len; i += 1) {
    const c = app.locals.clients[i];
    console.log(c.clientKey);
  }
  // console.log(app.locals.clients);


  socket.on('storeClientInfo', (data) => {
    for (let i = 0, len = app.locals.clients.length; i < len; i += 1) {
      const c = app.locals.clients[i];
      // console.log(data.clientKey);
      if (c.clientKey === data.clientKey) {
        app.locals.clients[i].clientId = socket.id;
        // console.log(`${app.locals.clients[i].clientId} ${app.locals.clients[i].clientKey}`);
        console.log(app.locals.clients);
        break;
      }
    }
  });

  socket.on('display', () => {
    app.locals.displayId = socket.id;
    io.to(app.locals.displayId).emit('client_list', app.locals.clients);
    console.log(`Borne id: ${app.locals.displayId}`);
  });

  socket.on('set_color', (data) => {
    for (let i = 0, len = app.locals.clients.length; i < len; i += 1) {
      if (app.locals.clients[i].clientKey === data.client){
        io.to(app.locals.clients[i].clientId).emit('set_color', data.color);
      }
    }
    console.log(data);
  });

  socket.on('cursor', (data) => {
    // console.log('Mobile id:' + cursorId);
    io.to(app.locals.displayId).emit('displayCursor', data.clientKey);
  });

  socket.on('move', (data) => {
    io.to(app.locals.displayId).emit('data', data);
  });

  socket.on('click', (data) => {
    io.to(app.locals.displayId).emit('remote_click', data);
  });

  socket.on('start_posting', (data) => {
    io.to(data).emit('start_posting');
  });

  socket.on('posting', (content) => {
    io.to(app.locals.displayId).emit('posting', content);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    const key = findKey(socket.id);
    deleteId(key);
    io.to(app.locals.displayId).emit('disconnect_user', key);
    if (app.locals.clients.length === 3
      && app.locals.clients[app.locals.clients.length - 1].clientId !== null) {
      clientKey = makeId(8);
      app.locals.clients.push({ clientKey, clientId: null });
      io.to(app.locals.displayId).emit('reload_qr');
    }
    console.log(app.locals.clients);
  });
});

console.log(process.env[process.env.PORT]);
http.listen(process.env.PORT ? process.env[process.env.PORT] : 8080);
