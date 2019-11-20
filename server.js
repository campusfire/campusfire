const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs');
const bodyParser = require('body-parser');
const qr = require('qrcode');
const { url } = require('./config');

let displayId;
const clients = [];

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
  clients.push(clientInfo);
  genQr(`${url}/m/${result}`);
  return result;
}

function findKey(id) {
  for (let i = 0, len = clients.length; i < len; i += 1) {
    const c = clients[i];

    if (c.clientId === id) {
      return c.clientKey;
    }
  }
  return null;
}

function deleteId(clientKey) { // sera utile pour déconnecter les users
  for (let i = 0, len = clients.length; i < len; i += 1) {
    const c = clients[i];

    if (c.clientKey === clientKey) {
      clients.splice(i, 1);
      break;
    }
  }
}

let clientKey = makeId(8); // last client key

app.get('/ping', (req, res) => res.send('pong'));

app.get('/display/:key', (req, res) => {
  if (req.params.key === 'fire') {
    res.send('ok');
  } else { res.send('ko'); }
});

app.get('/mobile/:key', (req, res) => {
  let userAuthorized = false;
  for (let i = 0, len = clients.length; i < len; ++i) {
    if (req.params.key === clients[i].clientKey && clients[i].clientId === null) {
      userAuthorized = true;
      if (clients.length < 4 && clients[i].clientId === null) {
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

app.get('/postit.json', (req, res) => {
  res.sendFile(path.resolve(`${__dirname}/src/Display/postit.json`));
});

app.post('/postit.json', (req, res) => {
  fs.readFile(path.resolve(`${__dirname}/src/Display/postit.json`), 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      const obj = JSON.parse(data);
      obj.text.push(req.body);
      const json = JSON.stringify(obj);
      fs.writeFile(
        path.resolve(`${__dirname}/src/Display/postit.json`),
        json,
        'utf8',
        (error) => { if (error) { res.send('Error!'); } else { res.send('Post-it added!'); } },
      ); // write it back
    }
  });
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
  for (let i = 0, len = clients.length; i < len; i += 1) {
    const c = clients[i];
    // console.log(`Client ID: ${clients[i].clientId} Client key:${clients[i].clientKey}`);
    console.log(c.clientKey);
  }
  // console.log(clients);


  socket.on('storeClientInfo', (data) => {
    for (let i = 0, len = clients.length; i < len; i += 1) {
      const c = clients[i];
      // console.log(data.clientKey);
      if (c.clientKey === data.clientKey) {
        clients[i].clientId = socket.id;
        // console.log(`${clients[i].clientId} ${clients[i].clientKey}`);
        console.log(clients);
        break;
      }
    }
  });

  socket.on('debug', (log) => {
    console.log('DEBUG: ', log);
  });

  socket.on('display', () => {
    displayId = socket.id;
    io.to(displayId).emit('client_list', clients);
    console.log(`Borne id: ${displayId}`);
  });

  socket.on('cursor', (data) => {
    // console.log('Mobile id:' + cursorId);
    io.to(displayId).emit('displayCursor', data.clientKey);
  });

  socket.on('touchMove', (data) => {
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
    if (clients.length === 3 && clients[clients.length - 1].clientId !== null) {
      clientKey = makeId(8);
      io.to(displayId).emit('reload_qr');
    }
    console.log(clients);
  });
});

console.log(process.env[process.env.PORT]);
http.listen(process.env.PORT ? process.env[process.env.PORT] : 8080);
