import React, { Component } from 'react';
import io from 'socket.io-client';
import logo from '../Assets/cfwhite.png';
import '../App.css';
import Pointer from './Pointer';
import Radial from './Radial';
import Container from './Container';

const getContainers = async (displayKey) => fetch(`/content/${displayKey}`, {
  method: 'GET',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
}).then((data) => data.json())
  .then((postits) => postits)
  .catch((err) => Promise.reject(err));

function updateContainer(container) {
  return fetch(`/content/${container.id}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-type': 'application/json',
    },
    body: JSON.stringify(container),
  });
}

function updateAllContainers(containers) {
  return 0;
  /* fetch('/all/postit.json', {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-type': 'application/json',
    },
    body: JSON.stringify(containers),
  }); */
}

function sortContainersZIndex(containers) {
  containers.sort((a, b) => ((a.z || 0) - (b.z || 0)));
  const sortedContainers = containers.map((container, index) => (
    {
      ...container,
      z: index,
    }
  ));
  updateAllContainers(sortedContainers);
  // console.log('sorted', sortedContainers);
  return sortedContainers;
}

class Display extends Component {
  constructor(props) {
    super(props);

    this.state = {
      containers: [],
      cursors: {},
      keyChecked: false,
      qrPath: '/qr',
      colors: {
        maroon: false, gold: false, forestgreen: false, mediumorchid: false, orange: false, lightskyblue: false, aqua: false, chocolate: false,
      },
      key: null,
      // socket: null,
    };
    this.threshold = 20;
  }

  async componentDidMount() {
    const { match: { params: { key } } } = this.props;
    await this.checkKey(key);
    const { keyChecked, colors } = this.state;
    if (keyChecked) {
      // load from back
      const { containers } = this.state;
      const postits = await getContainers(key);
      postits.forEach((postit) => { containers.push(postit); });
      const sortedContainers = sortContainersZIndex(containers);
      this.setState({ containers: sortedContainers, key });

      // socket
      const socket = io();
      this.socket = socket;

      socket.emit('display');

      socket.on('client_list', (clients) => { // refresh cursors on page reloads
        const { cursors } = this.state;
        clients.forEach((client) => {
          if (client.clientId) {
            const color = this.pickColor();
            cursors[client.clientKey] = {
              x: 16, y: 16, color, showRadial: false, draggedContainerId: null, posting: false, pressing: false,
            };
          }
        });
        this.setState({
          cursors,
        });
      });

      socket.on('move', (data) => { // to move cursor
        const { cursors } = this.state;
        if (data.length === 3) {
          if (cursors[data[2]].draggedContainerId) {
            this.moveContainer(data);
          }
          this.moveCursor(data);
        }
      });

      socket.on('remote_pressing', (data) => {
        const { cursors } = this.state;
        // console.log('remote pressing');
        if (data.clientKey != null) {
          cursors[data.clientKey].pressing = true;
          this.setState({ cursors });
        }
      });

      socket.on('remote_stop_pressing', async (data) => {
        const { cursors, containers: updatedContainers } = this.state;
        // console.log('remote stop pressing');
        if (data.clientKey != null) {
          // Reset cursor color
          cursors[data.clientKey].pressing = false;
          this.setState({ cursors });
          const { draggedContainerId } = cursors[data.clientKey];
          if (draggedContainerId !== null) {
            const updatedContainer = updatedContainers.filter(
              (container) => container.id === draggedContainerId,
            )[0];
            await updateContainer(updatedContainer);
            cursors[data.clientKey].draggedContainerId = null;
            socket.emit('stop_dragging', data.clientId);
            const sortedContainersZ = sortContainersZIndex(updatedContainers);
            this.setState({ containers: sortedContainersZ, cursors });
          }
        }
      });

      socket.on('dir', (data) => { // to move cursor
        if (data.length === 2) {
          this.selectDir(data);
        }
      });

      socket.on('display_cursor', (senderKey) => { // to display cursor on user connection
        const { cursors } = this.state;
        if (senderKey != null) {
          const color = this.pickColor();
          cursors[senderKey] = {
            x: 16, y: 16, color, showRadial: false, draggedContainerId: null, posting: false, pressing: false,
          };
          this.setState({ cursors });

          // Envoi de la couleur au mobile pour set le background
          socket.emit('set_color', { client: senderKey, color });
        }
        // console.log(cursors);
      });

      socket.on('disconnect_user', (senderKey) => { // removes cursor when user disconnects
        const { cursors } = this.state;
        if (cursors[senderKey]) {
          colors[cursors[senderKey].color] = false;
          delete cursors[senderKey];
          this.setState({ cursors });
        }
      });

      socket.on('reload_qr', () => { // reload qr on user connection
        let { qrPath } = this.state;
        qrPath += `?${Date.now()}`;
        this.setState({
          qrPath,
        });
      });

      socket.on('posting', async (data) => {
        const { cursors, containers: newContainers } = this.state;
        const { contentType, content } = data;
        const cursor = cursors[data.clientKey];
        const container = {
          id: (new Date()).valueOf(),
          contentType,
          content,
          x: cursor.x,
          y: cursor.y,
          z: containers.length,
        };
        // console.log('container', container);
        newContainers.push(container); // front
        await this.postContainer(container); // back
        cursors[data.clientKey].posting = false;
        const sortedContainers = sortContainersZIndex(newContainers);
        this.setState({
          containers: sortedContainers,
          cursors,
        });
      });

      socket.on('remote_click', async (data) => {
        const { cursors } = this.state;
        console.log('click', cursors[data.clientKey].x, cursors[data.clientKey].y);
      });

      socket.on('remote_long_press', (data) => {
        const { cursors, containers: targets } = this.state;
        if (data.clientKey != null && cursors[data.clientKey].draggedContainerId == null) {
          const {
            left: cursorLeft,
            right: cursorRight,
            top: cursorTop,
            bottom: cursorBottom,
          } = document.getElementById(data.clientKey).getBoundingClientRect();
          const x = (cursorLeft + cursorRight) / 2;
          const y = (cursorTop + cursorBottom) / 2;
          const boundingBoxes = targets.map(
            // (target) => ({
            //   id: target.id,
            //   ...document.getElementsByName('Container').getBoundingClientRect(),
            // }),
            (target) => {
              const {
                left, right, top, bottom,
              } = document.getElementById(`postit_${target.id}`).getBoundingClientRect();
              return {
                id: target.id,
                left,
                right,
                top,
                bottom,
              };
            },
          );
          const draggedContainer = boundingBoxes.find((boundingBox) => {
            const {
              left, right, top, bottom,
            } = boundingBox;
            return (x > left && x < right && y > top && y < bottom);
          });
          if (draggedContainer) {
            cursors[data.clientKey].draggedContainerId = draggedContainer.id;
            // console.log('dragging container');
          } else {
            cursors[data.clientKey].showRadial = true;
            socket.emit('radial_open', data.clientId);
          }
          this.setState({
            cursors,
          });
        }
      });

      socket.on('remote_cancel', (data) => {
        const { cursors } = this.state;
        // console.log('remote cancel');
        if (data.clientKey != null) {
          cursors[data.clientKey].posting = false;
          this.setState({ cursors });
        }
      });

      socket.on('remote_close_radial', (data) => {
        // console.log('remote close radial');
        if (data.clientKey != null) {
          this.closeRadial(data.clientKey);
        }
      });

      socket.on('remote_selected_post_type', (data) => {
        const { cursors } = this.state;
        if (data.clientKey != null) {
          cursors[data.clientKey].showRadial = false;
          cursors[data.clientKey].posting = true;
          this.setState({
            cursors,
          });
        }
      });
    }
  }

  getState() {
    const { containers } = this.state;
    // console.log('state', containers);
  }

  closeRadial(clientId) {
    const { cursors } = this.state;
    // console.log('close radial', cursors[clientId]);
    cursors[clientId].showRadial = false;
    this.setState({
      cursors,
    });
  }

  pickColor() { // définir une couleur pour l'utilisateur qui dure jusqu'à ce qu'il se déconnecte
    const { colors } = this.state;
    const colorsEntries = Object.entries(colors);
    for (let i = 0, len = colorsEntries.length; i < len; i += 1) {
      if (colorsEntries[i][1] === false) {
        colors[colorsEntries[i][0]] = true;
        this.setState({ colors });
        return colorsEntries[i][0];
      }
    }
    return 'red'; // par défaut
  }

  moveCursor(data) {
    const displacement = data[1] * 0.3;
    const key = data[2];
    const dx = displacement * Math.cos(data[0]);
    const dy = -displacement * Math.sin(data[0]);
    const { cursors } = this.state;
    if (displacement > 6) {
      cursors[key].pressing = false;
    }
    let { x, y } = cursors[key];

    if (key !== null) {
      x += dx;
      y += dy;
    }
    const {
      left, right, top, bottom,
    } = document.getElementById('root').getBoundingClientRect();
    if (x <= 0 || x >= right - left) {
      x -= dx;
    }
    if (y <= 0 || y >= bottom - top) {
      y -= dy;
    }
    cursors[key].x = x;
    cursors[key].y = y;
    this.setState({
      cursors,
    });
  }

  moveContainer(data) {
    const displacement = data[1] * 0.3;
    const key = data[2];
    const dx = displacement * Math.cos(data[0]);
    const dy = -displacement * Math.sin(data[0]);
    const { cursors, containers } = this.state;
    const containerIndex = containers.findIndex(
      (container) => container.id === cursors[key].draggedContainerId,
    );
    let { x, y } = containers[containerIndex];

    if (key !== null) {
      x += dx;
      y += dy;
    }
    const {
      left, right, top, bottom,
    } = document.getElementById('root').getBoundingClientRect();
    if (x <= 0 || x >= right - left) {
      x -= dx;
    }
    if (y <= 0 || y >= bottom - top) {
      y -= dy;
    }
    containers[containerIndex].x = x;
    containers[containerIndex].y = y;
    containers[containerIndex].z = containers.length;
    this.setState({
      containers,
    });
    // console.log(containers);
    this.getState();
  }

  // TODO: lint
  selectDir(data) {
    const menu = document.querySelector(`#radial_${data[1]}`);
    if (menu !== null) {
      const element = data[0];
      const classToSelect = element === 'None' ? 'innerCircle' : `pieSlice${element}`;
      this.postType = element;
      menu.querySelector(`.${classToSelect}`).style.backgroundColor = 'white';
      menu.querySelectorAll(`div:not(.${classToSelect})`).forEach((el) => {
        el.style.backgroundColor = 'grey';
      });
    }
  }

  postContainer(container) {
    const { key } = this.state;
    return fetch(`/content/${key}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(container),
    }).catch((err) => console.log('fetch error', err));
  }

  async checkKey(key) {
    return fetch(`/display/${key}`)

      .then((resp) => resp.text()
        .then((txt) => {
          if (txt === 'ok') {
            this.setState({ keyChecked: true });
          } else {
            this.setState({ keyChecked: false });
          }
        })
        .catch((error) => {
          this.setState({ keyChecked: false });
          return Promise.reject(Error(error.message));
        }));
  }

  render() {
    const {
      containers, cursors, keyChecked, qrPath,
    } = this.state;
    const containersToRender = containers.map((container) => (
      <Container
        id={`postit_${container.id}`}
        contentType={container.contentType}
        content={container.content}
        x={container.x}
        y={container.y}
        z={container.z || 0}
      />
    ));
    const cursorsEntries = Object.entries(cursors);
    const cursorsToRender = cursorsEntries.map(
      ([key, object]) => (
        <Pointer
          key={key}
          id={key}
          color={object.color}
          x={object.x}
          y={object.y}
          posting={object.posting}
          pressing={object.pressing}
        />
      ),
    );
    const loggedUsers = cursorsEntries.map(
      ([key, object]) => (
        <div
          className="logSquares"
          key={`square:${key}`}
          id={`square:${key}`}
          style={{
            backgroundColor: `${object.color}`,
          }}
        />
      ),
    );
    const radialsToRender = cursorsEntries.length ? cursorsEntries.reduce((result, cursor) => {
      if (cursor[1].showRadial) {
        result.push(
          <Radial
            socket={this.socket}
            key={cursor[0]}
            id={cursor[0]}
            color={cursor[1].color}
            x={cursor[1].x}
            y={cursor[1].y}
          />,
        );
      }
      return result;
    }, []) : '';
    return (
      keyChecked
        ? (
          <div className="Display">
            <header>
              <img src={logo} className="Display-logo" alt="logo" />
            </header>
            <div id="containers">
              {containersToRender}
              {cursorsToRender}
              {radialsToRender}
            </div>
            <footer>
              <img src={qrPath} alt="" className="qr" />
              <div id="loggedUsers_wrapper">
                {loggedUsers}
              </div>
            </footer>
          </div>
        ) : (
          <div className="Display" />
        )
    );
  }
}

export default Display;
