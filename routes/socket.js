/* eslint-disable no-param-reassign */
const { makeId } = require('./utils');

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
      app.locals.displayId = socket.id;
      io.to(app.locals.displayId).emit('client_list', app.locals.clients);
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
      io.to(app.locals.displayId).emit('display_cursor', data.clientKey);
    });

    socket.on('move', (data) => {
      //console.log('debug', 'moving');
      io.to(app.locals.displayId).emit('move', data);
    });

    socket.on('dir', (data) => {
      //console.log('debug', 'changing direction');
      io.to(app.locals.displayId).emit('dir', data);
    });

    socket.on('click', (data) => {
      io.to(app.locals.displayId).emit('remote_click', data);
    });

    socket.on('long_press', (data) => {
      io.to(app.locals.displayId).emit('remote_long_press', data);
    });

    socket.on('close_radial', (data) => {
      io.to(app.locals.displayId).emit('remote_close_radial', data);
    });

    socket.on('selected_post_type', (data) => {
      io.to(app.locals.displayId).emit('remote_selected_post_type', data);
    });

    socket.on('dragging_container', (data) => {
      io.to(data).emit('dragging_container');
    });

    socket.on('radial_open', (data) => {
      io.to(data).emit('radial_open');
    });

    socket.on('posting', (data) => {
      console.log('POSTING');
      io.to(app.locals.displayId).emit('posting', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
      const key = findKey(socket.id);
      deleteId(key);
      io.to(app.locals.displayId).emit('disconnect_user', key);
      if (app.locals.clients.length === app.locals.maxClients - 1
        && app.locals.clients[app.locals.clients.length - 1].clientId !== null) {
        const clientKey = makeId(8);
        app.locals.clients.push({ clientKey, clientId: null });
        io.to(app.locals.displayId).emit('reload_qr');
      }
      console.log(app.locals.clients);
    });

    // DEVELOPMENT ONLY!
    socket.on('debug', (content) => {
      console.log('debug', content);
    });
  });
};
