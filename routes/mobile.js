const express = require('express');
const { makeId } = require('./utils');

const app = express.Router();


app.get('/mobile/:key', (req, res) => {
  let userAuthorized = false;
  for (let i = 0, len = req.app.locals.clients.length; i < len; i += 1) {
    if (req.params.key === req.app.locals.clients[i].clientKey
        && req.app.locals.clients[i].clientId === null) {
      userAuthorized = true;
      if (req.app.locals.clients.length < 4 && req.app.locals.clients[i].clientId === null) {
        const clientKey = makeId(8);
        req.app.locals.clients.push({ clientKey, clientId: null });
        req.app.get('io').to(req.app.locals.displayId).emit('reload_qr');
      }
      break;
    }
  }
  if (userAuthorized) {
    res.send('ok');
  } else { res.send('ko'); }
});

module.exports = app;