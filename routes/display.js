/* eslint-disable no-underscore-dangle */
const express = require('express');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const Display = require('../models/display');
const Content = require('../models/content');
const User = require('../models/user');

const app = express.Router();

const asyncDeleteMultipleFiles = (list_names_in_upload) => {
  Promise.all(list_names_in_upload.map((file) => {
    if (file) {
      fs.unlink(`public/uploads/${file}`, (err) => {
        if (err) {
          console.log(`(ERROR) An error occured when deleting the file : ${file}`);
          console.log(`(ERROR) This error is the following : ${err}`);
        }
        console.log(`${file} was deleted`);
      });
    }
  }));
};

const filterMediaToDeleteFromContentsAndReturnNames = (list_of_contents) => list_of_contents.map((content) => (content.type === 'TEXT' ? undefined : content.payload)).filter((e) => e);

const fadingLevel = (post_lifetime, post_date) => {
  const post_lifetime_spent = moment().diff(moment(post_date), 'm');
  const post_lifetime_remaining = post_lifetime - post_lifetime_spent;
  let opacity_level = 1;
  if (post_lifetime_remaining < 80) {
    opacity_level = post_lifetime_remaining / 60 * 0.75;
  }
  return opacity_level; // return opacity level between 0 and 1
};

const expirationTest = (post_lifetime, post_date) => {
  const moment_post = moment(post_date);
  moment_post.add(post_lifetime, 'm');
  return moment().isBefore(moment_post); // return false if post expired
};

const alreadyArchivedTest = (post_deletion_date) => {
  let is_archived = true;
  if (post_deletion_date == null) { is_archived = false; }
  return is_archived; // return true if post is already archived
};

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
      Content.find({ display: display._id }, async (err2, contents) => {
        if (err2) res.send(JSON.stringify([]));
        const retour = [];
        const contents_to_delete_in_db = [];

        for (let i = 0; i < contents.length; i += 1) {
          if (expirationTest(contents[i].lifetime, contents[i].createdOn)) {
            retour.push({
              id: contents[i]._id,
              contentType: contents[i].type,
              content: contents[i].payload,
              x: contents[i].position.x,
              y: contents[i].position.y,
              lifetime: contents[i].lifetime,
            });
          } else if (!alreadyArchivedTest(contents[i].deletedOn)) {
            contents_to_delete_in_db.push(contents[i]);
            // Content.deleteOne({ _id: contents[i]._id }, (err3, result) => {
            //   if (err3) {
            //     res.send(err3);
            //   } else {
            //     console.log(`Object with id ${contents[i]._id} deleted from database`);
            //   }
            // });
            const query = { _id: contents[i]._id };
            Content.updateOne(query, { deletedOn: Date.now() }, (err3, result) => {
              if (err3) {
                res.send(err3);
              } else {
                console.log(`Object with id ${contents[i]._id} successfully archived`);
              }
            });
          }
        }
        // await asyncDeleteMultipleFiles(filterMediaToDeleteFromContentsAndReturnNames(contents_to_delete_in_db));
        res.send(JSON.stringify(retour));
      });
    }
  });
});

app.post('/content/:key', (req, res) => {
  Display.findOne({ token: req.params.key }, async (err, display) => {
    if (err) res.send('fail');
    else {
      const newContent = new Content({
        type: req.body.contentType,
        payload: req.body.content,
        author_id:req.body.creatorKey,
        position: {
          x: req.body.x,
          y: req.body.y,
        },
        display: display._id,
        lifetime: req.body.lifetime || 60, // default lifetime is 60 minutes
      });
      const id_content = await newContent.save();
      res.json({ id_content: id_content._id });
    }
  });
});

app.put('/content/:id_content', (req, res) => {
  console.log('(MODIFY_post) id', req.params.id_content);
  Content.findOne({ _id: req.params.id_content }, (err, content) => {
    if (err) res.send('fail');
    else {
      content.lifetime = req.body.lifetime;
      content.payload = req.body.content;
      content.position.x = req.body.x;
      content.position.y = req.body.y;
      content.position.z = req.body.z;
      content.save();
      res.send('ok');
    }
  });
});

app.get('/user/:key', (req, res) => {
  Display.findOne({ token: req.params.key }, (err, display) => {
    if (err) res.send(JSON.stringify([]));
    else {
      User.find({ display: display._id }, async (err2, users) => {
        if (err2) res.send(JSON.stringify([]));

        for (let i = 0; i < users.length; i += 1) {
          if (users[i].deletedOn == null) {
            retour.push({
              id: users[i]._id,
              user_key: users[i].user_key,
              nb_like: users[i].nb_like,
              nb_dislike: users[i].nb_dislike,
              nb_post: users[i].nb_post,
              disconnectedOn: users[i].disconnectedOn,
            });
          }
        }
        res.send(JSON.stringify(retour));
      });
    }
  });
});

app.post('/user/:key', (req, res) => {
  Display.findOne({ token: req.params.key }, async (err, display) => {
    if (err) res.send('fail');
    else {
      const newUser = new User({
        display: display._id,
        user_key: req.body.user_key,
      });
      const new_user = await newUser.save();
      res.json({ id_user: new_user._id });
    }
  });
});

app.put('/user/:id_user', (req, res) => {
  User.findOne({ _id: req.params.id_user }, (err, user) => {
    if (err) res.send('fail');
    else {
      user.nb_like = req.body.nb_like;
      user.nb_dislike = req.body.nb_dislike;
      user.nb_post = req.body.nb_post;
      user.disconnectedOn = req.body.disconnectedOn;
      user.save();
      res.send('ok');
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

app.put('/postit.json', (req, res) => {
  fs.readFile(path.resolve(`${__dirname}/../postit.json`), 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      const obj = JSON.parse(data);
      const newPostIt = req.body;
      const newObj = obj.filter((postIt) => postIt.id !== newPostIt.id);
      newObj.push(newPostIt);
      const json = JSON.stringify(newObj);
      fs.writeFile(
        path.resolve(`${__dirname}/../postit.json`),
        json,
        'utf8',
        (error) => { if (error) { res.send('Error!'); } else { res.send('Post-it updated!'); } },
      );
    }
  });
});

app.put('/all/postit.json', (req, res) => {
  console.log('AAAAAAAAAAAAAAAA');
  const json = JSON.stringify(req.body);
  fs.writeFile(
    path.resolve(`${__dirname}/../postit.json`),
    json,
    'utf8',
    (error) => { if (error) { res.send('Error!'); } else { res.send('Post-it updated!'); } },
  );
});

app.get('/qr', (req, res) => {
  res.sendFile(path.resolve(`${__dirname}/../qr.png`));
});

module.exports = {
  app,
  expirationTest,
  alreadyArchivedTest,
  fadingLevel,
  filterMediaToDeleteFromContentsAndReturnNames,
  asyncDeleteMultipleFiles,
};
