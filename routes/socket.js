/* eslint-disable no-param-reassign */
const schedule = require('node-schedule');
const mongoose = require('mongoose');
const Display = require('../models/display');
const Content = require('../models/content');
const { expirationTest, fadingLevel } = require('./display');
const { makeId } = require('./utils');
const { filterMediaToDeleteFromContentsAndReturnNames, asyncDeleteMultipleFiles } = require('./display');

// eslint-disable-next-line func-names
module.exports = function (app, io) {
  // Helper functions
  function findKey(id) {
    for (let i = 0, len = app.locals.clients.length; i < len; i += 1) {
      const c = app.locals.clients[i];

      if (c.clientId === id) {
        return c.clientKey;
      }
    }
    return null;
  }

  function deleteId(clientKey) { // sera utile pour déconnecter les users
    for (let i = 0, len = app.locals.clients.length; i < len; i += 1) {
      const c = app.locals.clients[i];

      if (c.clientKey === clientKey) {
        app.locals.clients.splice(i, 1);
        break;
      }
    }
  }

  // this job runs every minute
  schedule.scheduleJob({ start: new Date(Date.now() + 10000), rule: '*/5 * * * * *' }, () => {
    Display.find({}, (err, allDisplays) => {
      if (err) console.log(err);
      else {
        allDisplays.map(async (display) => {
          const name_socket = `refresh_posts_${display.token}`;
          const all_contents_to_check_expiry_date = await Content.find({ display: display._id }).select('lifetime _id createdOn payload type');
          const contents_to_delete_in_db = all_contents_to_check_expiry_date.filter((content) => !expirationTest(content.lifetime, content.createdOn));
          const contents_to_keep_in_db = all_contents_to_check_expiry_date.filter((content) => expirationTest(content.lifetime, content.createdOn));
          const fading_levels = [];
          if (contents_to_delete_in_db.length > 0) {
            console.log('Refresh post to delete : ', contents_to_delete_in_db);
          }
          if (contents_to_keep_in_db.length > 0) {
            contents_to_keep_in_db.forEach((content) => {
              fading_levels.push(fadingLevel(content.lifetime, content.createdOn));
            });
          }
          const data = { contents_to_delete_in_db, contents_to_keep_in_db, fading_levels };
          io.emit(name_socket, data);
          // await asyncDeleteMultipleFiles(filterMediaToDeleteFromContentsAndReturnNames(contents_to_delete_in_db));
          const contents_to_delete_in_db_ids = contents_to_delete_in_db.map((elt) => mongoose.Types.ObjectId(elt._id));
          // await Content.remove({ _id: { $in: contents_to_delete_in_db_ids } });
          await Content.updateMany({ _id: { $in: contents_to_delete_in_db_ids } }, { deletedOn: Date.now() });
        });
      }
    });
  });

  // Client callbacks
  io.on('connection', (socket) => {
    console.log(`Socket ${socket.id} connected`);
    for (let i = 0, len = app.locals.clients.length; i < len; i += 1) {
      const c = app.locals.clients[i];
      console.log(c.clientKey);
    }
    // console.log(app.locals.clients);


    socket.on('store_client_info', (data) => {
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
      // No need to keep the following line except for loging the id of the new display that just connected
      app.locals.displayId = socket.id; // This line stores the id of the last display which connected
      io.emit('client_list', app.locals.clients);
      console.log(`Borne id: ${app.locals.displayId}`);
    });

    socket.on('set_color', (data) => {
      for (let i = 0, len = app.locals.clients.length; i < len; i += 1) {
        if (app.locals.clients[i].clientKey === data.client) {
          io.to(app.locals.clients[i].clientId).emit('set_color', data.color);
        }
      }
      console.log(data);
    });

    socket.on('cursor', (data) => {
      // console.log('Mobile id:' + cursorId);
      io.emit('display_cursor', data.clientKey);
    });

    socket.on('move', (data) => {
      // console.log('debug', 'moving');
      io.emit('move', data);
    });

    socket.on('dir', (data) => {
      // console.log('debug', 'changing direction');
      io.emit('dir', data);
    });

    socket.on('click', (data) => {
      io.emit('remote_click', data);
    });

    socket.on('pressing', (data) => {
      io.emit('remote_pressing', data);
    });

    socket.on('stop_pressing', (data) => {
      io.emit('remote_stop_pressing', data);
    });

    socket.on('long_press', (data) => {
      io.emit('remote_long_press', data);
    });

    socket.on('close_radial', (data) => {
      io.emit('remote_close_radial', data);
    });

    socket.on('cancel', (data) => {
      io.emit('remote_cancel', data);
    });

    socket.on('selected_post_type', (data) => {
      io.emit('remote_selected_post_type', data);
    });

    socket.on('dragging_container', (data) => {
      console.log('dragging_container DATA -> ', data);
      io.to(data).emit('dragging_container');
    });

    socket.on('radial_open', (data) => {
      console.log('radial_open DATA -> ', data);
      io.to(data).emit('radial_open');
    });

    socket.on('post_credits', (data) => {
      console.log('credits');
      io.emit('post_credits', data);
    });

    socket.on('posting', (data) => {
      console.log('POSTING');
      io.emit('posting', data);
    });

    socket.on('edit_post', (data) => {
      console.log('edit_post');
      io.to(app.locals.displayId).emit('edit_post', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
      const key = findKey(socket.id);
      deleteId(key);
      io.emit('disconnect_user', key);
      if (app.locals.clients.length === app.locals.maxClients - 1
        && app.locals.clients[app.locals.clients.length - 1].clientId !== null) {
        const clientKey = makeId(8);
        app.locals.clients.push({ clientKey, clientId: null });
        io.emit('reload_qr');
      }
      console.log(app.locals.clients);
    });

    socket.on('editable_post', (data) => {
      const editorClient = app.locals.clients.find((client) => {
        if (client.clientKey == data.clientKey) {
          return (client);
        }
      });
      //console.log("sending editable to :",editorClient.clientId);
      //console.log("data sent :",data);
      io.to(editorClient.clientId).emit('post_is_editable', data);
    });

    socket.on('not_editable_post', (data) => {
      const editorClient = app.locals.clients.find((client) => {
        if (client.clientKey == data.clientKey) {
          return (client);
        }
      });
      //console.log("sending not editable to :",editorClient.clientId);
      //console.log("data sent :",data);
      io.to(editorClient.clientId).emit('post_is_not_editable', data);
    });

    socket.on('likeable_post', (data) => {
      const editorClient = app.locals.clients.find((client) => {
        if (client.clientKey == data.clientKey) {
          return (client);
        }
      });
      io.to(editorClient.clientId).emit('post_is_not_editable', data);
    });


    socket.on('not_likeable_post', (data) => {
      const editorClient = app.locals.clients.find((client) => {
        if (client.clientKey == data.clientKey) {
          return (client);
        }
      });
      io.to(editorClient.clientId).emit('post_is_not_likeable', data);
    });

    // DEVELOPMENT ONLY!
    socket.on('debug', (content) => {
      console.log('debug', content);
    });
  });
};
