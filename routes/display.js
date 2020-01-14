/* eslint-disable no-underscore-dangle */
const express = require('express');
const fs = require('fs');
const path = require('path');
const Display = require('../models/display');
const Content = require('../models/content');

const app = express.Router();

app.get('/display/:key', (req, res) => {
  Display.findOne({ token: req.params.key }, (err, display) => {
    if (err) res.send('ko');
    else res.send('ok');
  });
});

app.get('/content/:key', (req, res) => {
  Display.findOne({ token: req.params.key }, (err, display) => {
    if (err) res.send(JSON.stringify([]));
    else {
      Content.find({ display: display._id }, (err2, contents) => {
        if (err2) res.send(JSON.stringify([]));
        const retour = [];

        for (let i = 0; i < contents.length; i += 1) {
          retour.push({
            id: contents[i]._id,
            contentType: contents[i].type,
            content: contents[i].payload,
            x: contents[i].position.x,
            y: contents[i].position.y,
          });
        }

        res.send(JSON.stringify(retour));
      });
    }
  });
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
