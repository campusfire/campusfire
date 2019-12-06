const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express.Router();

app.get('/display/:key', (req, res) => {
  if (req.params.key === 'fire') {
    res.send('ok');
  } else { res.send('ko'); }
});

app.get('/postit.json', (req, res) => {
  res.sendFile(path.resolve(`${__dirname}/../postit.json`));
});

app.post('/postit.json', (req, res) => {
  fs.readFile(path.resolve(`${__dirname}/../postit.json`), 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      const obj = JSON.parse(data);
      obj.push(req.body);
      const json = JSON.stringify(obj);
      fs.writeFile(
        path.resolve(`${__dirname}/../postit.json`),
        json,
        'utf8',
        (error) => { if (error) { res.send('Error!'); } else { res.send('Post-it added!'); } },
      ); // write it back
    }
  });
});

app.get('/qr', (req, res) => {
  res.sendFile(path.resolve(`${__dirname}/../qr.png`));
});

module.exports = app;
