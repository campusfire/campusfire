const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const qr = require('qrcode');
const { url } = require('./config');

let displayId;
app.locals.clients = [];

app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.json());

function genQr(str) {
  qr.toFile('qr.png', str);
}

function makeId(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  const clientInfo = { clientKey: result, clientId: null };
  app.locals.clients.push(clientInfo);
  genQr(`${url}/m/${result}`);
  return result;
}

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

app.use(displayRoutes);

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

app.get('/ping', (req, res) => res.send('pong'));

app.get('/mobile/:key', (req, res) => {
  let userAuthorized = false;
  for (let i = 0, len = app.locals.clients.length; i < len; i += 1) {
    if (req.params.key === app.locals.clients[i].clientKey && app.locals.clients[i].clientId === null) {
      userAuthorized = true;
      if (app.locals.clients.length < 4 && app.locals.clients[i].clientId === null) {
        clientKey = makeId(8);
        io.to(displayId).emit('reload_qr');
      }
      break;
    }
  }
  if (userAuthorized) {
    res.send('ok');
  } else { res.send('ko'); }
});

app.get('/key', (req, res) => {
  res.send(clientKey);
});

app.get('/qr', (req, res) => {
  res.sendFile(path.resolve(`${__dirname}/qr.png`));
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
    // console.log(`Client ID: ${app.locals.clients[i].clientId} Client key:${app.locals.clients[i].clientKey}`);
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
    displayId = socket.id;
    io.to(displayId).emit('client_list', app.locals.clients);
    console.log(`Borne id: ${displayId}`);
  });

  socket.on('set_color', (data) => {
    for (let i = 0, len = app.locals.clients.length; i < len; i += 1) {
      if (app.locals.clients[i].clientKey == data.client){
        io.to(app.locals.clients[i].clientId).emit('set_color', data.color);
      }
    }
    console.log(data);
  });

  socket.on('cursor', (data) => {
    // console.log('Mobile id:' + cursorId);
    io.to(displayId).emit('displayCursor', data.clientKey);
  });

  socket.on('move', (data) => {
    io.to(displayId).emit('data', data);
  });

  socket.on('click', (data) => {
    io.to(displayId).emit('remote_click', data);
  });

  socket.on('start_posting', (data) => {
    io.to(data).emit('start_posting');
  });

  socket.on('posting', (content) => {
    io.to(displayId).emit('posting', content);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    const key = findKey(socket.id);
    deleteId(key);
    io.to(displayId).emit('disconnect_user', key);
    if (app.locals.clients.length === 3 && app.locals.clients[app.locals.clients.length - 1].clientId !== null) {
      clientKey = makeId(8);
      io.to(displayId).emit('reload_qr');
    }
    console.log(app.locals.clients);
  });
});

console.log(process.env[process.env.PORT]);
http.listen(process.env.PORT ? process.env[process.env.PORT] : 8080);
