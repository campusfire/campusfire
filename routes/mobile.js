const express = require('express');
const multer = require('multer');
const path = require('path');
const { makeId } = require('./utils');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage }).single('file');

const app = express.Router();


app.get('/mobile/:key', (req, res) => {
  let userAuthorized = false;
  for (let i = 0, len = req.app.locals.clients.length; i < len; i += 1) {
    if (req.params.key === req.app.locals.clients[i].clientKey
        && req.app.locals.clients[i].clientId === null) {
      userAuthorized = true;
      if (req.app.locals.clients.length < req.app.locals.maxClients && req.app.locals.clients[i].clientId === null) {
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

app.post('/storage/:key', (req, res) => {
  console.log('posting key', req.params.key);
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      res.status(400).send('fail saving image');
    } else {
      console.log('saved file', req.file.path);
      res.send(req.file.filename);
    }
  });
});

module.exports = app;
