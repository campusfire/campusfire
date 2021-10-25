import React, { Component } from 'react';
import io from 'socket.io-client';
import logo from '../Assets/cfwhite.png';
import scanMe from '../Assets/scanMe.png';
import '../App.css';
import Pointer from './Pointer';
import Radial from './Radial';
import Container from './Container';

const creditsContent = 'Crédits : Gabriel Carlotti, Joséphine Solier, Victor Yvergniaux, Simon Sauvestre, Sébastien Gahat, François Carlué, Antoine Rousselot-Vigier, Romain Grondin, Thomas Rugliano, Adrien Laffargue, Fanis Michalakis, Maxime Vivier, Christian Martin, Antoine Mirande, Jules Seguin, François Brucker, Christian Jalain';

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
  return sortedContainers;
}

const initColors = {
  maroon: false, gold: false, forestgreen: false, mediumorchid: false, orange: false, lightskyblue: false, aqua: false, chocolate: false,
}

class Display extends Component {
  constructor(props) {
    super(props);

    this.state = {
      containers: [],
      cursors: {},
      keyChecked: false,
      qrPath: '/qr',
      colors: { ...initColors },
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
        this.setState({ colors: { ...initColors } })
        clients.forEach((client) => {
          if (client.clientId) {
            const color = this.pickColor();
            cursors[client.clientKey] = {
              x: 16, y: 16, color, showRadial: false, draggedContainerId: null, posting: false, pressing: false, editable: false,
            };
          }
        });
        this.setState({
          cursors,
        });
      });

      socket.on('move', (data) => { // to move cursor
        const { cursors, containers } = this.state;
        if (data.length === 3) {
          if (cursors[data[2]].draggedContainerId) {
            this.moveContainer(data);
          }
          this.moveCursor(data);
        }
        //now checking if cursor is above an editabe post
        const topBox = this.selectTopContainer({ clientKey: data[2], clientId: "foo" });
        if (topBox == undefined && cursors[data[2]].editable == true) { // if cursor is above no post and was above a post before => not editable anymore
          socket.emit('not_editable_post', { clientKey: data[2] });
          cursors[data[2]].editable = false;
          this.setState({ cursors });
        }
        else if (topBox != undefined && cursors[data[2]].editable == false) { //if cursor is above a post and wasn't before => set to editable
          const topContainer = containers.find((obj) => obj.id == topBox.id)
          if (topContainer.creatorKey == data[2]) {
            socket.emit('editable_post', { clientKey: data[2], id: topContainer.id, postType: topContainer.contentType, postContent: topContainer.content, postLifetime: topContainer.lifetime });
            cursors[data[2]].editable = true;
            this.setState({ cursors });
          }
        }
      });

      socket.on('remote_pressing', (data) => {
        const { cursors } = this.state;
        if (data.clientKey != null) {
          cursors[data.clientKey].pressing = true;
          this.setState({ cursors });
        }
      });

      socket.on('remote_stop_pressing', async (data) => {
        const { cursors, containers: updatedContainers } = this.state;
        if (data.clientKey != null) {
          // Reset cursor color
          cursors[data.clientKey].pressing = false;
          this.setState({ cursors });
          const { draggedContainerId } = cursors[data.clientKey];
          if (draggedContainerId !== null) {
            document.getElementById(`postit_${draggedContainerId}`).style.boxShadow = '';
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
            x: 16, y: 16, color, showRadial: false, draggedContainerId: null, posting: false, pressing: false, editable: false,
          };
          this.setState({ cursors });

          // Envoi de la couleur au mobile pour set le background
          socket.emit('set_color', { client: senderKey, color });
        }
      });

      socket.on('disconnect_user', (senderKey) => { // removes cursor when user disconnects
        const { cursors, containers } = this.state;
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
        const { contentType, content, lifetime, clientKey } = data;
        const cursor = cursors[clientKey];
        const container = {
          contentType,
          content,
          x: cursor.x,
          y: cursor.y,
          z: containers.length,
          lifetime,
          creatorKey: clientKey,
        };
        const { id_content } = JSON.parse(await (await this.postContainer(container)).text()); // back
        container['id'] = id_content;
        newContainers.push(container); // front
        cursors[data.clientKey].posting = false;
        const sortedContainers = sortContainersZIndex(newContainers);
        this.setState({
          containers: sortedContainers,
          cursors,
        });
      });

      socket.on('edit_post', async (data) => {
        const { containers } = this.state;
        const { content, lifetime, id } = data;
        let newContainerContent = {
          content,
          lifetime
        };
        const newContainers = containers.map(container => {
          if (container.id == id) {
            newContainerContent = { ...container, ...newContainerContent };
            return newContainerContent
          }
          return container
        });
        this.setState({ containers: newContainers });
        await updateContainer(newContainerContent)
      });

      socket.on('remote_click', async (data) => {
        const { cursors } = this.state;
        // console.log('click', cursors[data.clientKey].x, cursors[data.clientKey].y);
      });

      const name_socket = `refresh_posts_${key}`;
      console.log('name_socket', name_socket);
      socket.on(name_socket, async (contents_to_remove) => {
        contents_to_remove = contents_to_remove.map((elt) => elt._id);
        if (contents_to_remove.length > 0) {
          this.setState((prevState) => ({
            ...prevState,
            containers: prevState.containers.filter((cont) => !contents_to_remove.includes(cont.id)),
          }));
        }
      });

      socket.on('remote_long_press', (data) => {
        const draggedContainer = this.selectTopContainer(data);
        const { cursors, containers: targets } = this.state;
        if (draggedContainer) {
          cursors[data.clientKey].draggedContainerId = draggedContainer.id;
          document.getElementById(`postit_${draggedContainer.id}`).style.boxShadow = `0 0 0 5px ${cursors[data.clientKey].color}`;
        } else {
          cursors[data.clientKey].showRadial = true;
          socket.emit('radial_open', data.clientId);
        }
        this.setState({
          cursors,
        });
      });

      socket.on('remote_cancel', (data) => {
        const { cursors } = this.state;
        if (data.clientKey != null) {
          cursors[data.clientKey].posting = false;
          this.setState({ cursors });
        }
      });

      socket.on('remote_close_radial', (data) => {
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

      socket.on('post_credits', async (data) => {
        const { cursors, containers: newContainers } = this.state;
        cursors[data.clientKey].showRadial = false;
        const cursor = cursors[data.clientKey];
        const container = {
          id: (new Date()).valueOf(),
          contentType: 'TEXT',
          content: creditsContent,
          x: cursor.x,
          y: cursor.y,
          z: containers.length,
        };
        newContainers.push(container); // front
        await this.postContainer(container); // back
        cursors[data.clientKey].posting = false;
        const sortedContainers = sortContainersZIndex(newContainers);
        this.setState({
          containers: sortedContainers,
          cursors,
        });
      });
    }
  }

  getState() {
    const { containers } = this.state;
  }

  closeRadial(clientId) {
    const { cursors } = this.state;
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

  selectTopContainer(data) {
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
            depth: target.z
          };
        },
      );
      //we need to sort containers by depth
      boundingBoxes.sort((a, b) => (b.depth - a.depth));
      //then we take the first one (the one at the foreground)
      const draggedContainer = boundingBoxes.find((boundingBox) => {
        const {
          left, right, top, bottom,
        } = boundingBox;
        return (x > left && x < right && y > top && y < bottom);
      })
      return (draggedContainer);
    }

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
    const containerId = containers[containerIndex].id;
    if (key !== null) {
      x += dx;
      y += dy;
    }
    const {
      left, right, top, bottom,
    } = document.getElementById('root').getBoundingClientRect();
    const {
      left: containerLeft, right: containerRight, top: containerTop, bottom: containerBottom,
    } = document.getElementById(`postit_${containerId}`).getBoundingClientRect();
    const containerHeight = containerBottom - containerTop;
    const containerWidth = containerRight - containerLeft;
    if (x <= 0 || x >= right - left - containerWidth) {
      x -= dx;
    }
    if (y <= 0 || y >= bottom - top - containerHeight) {
      y -= dy;
    }
    containers[containerIndex].x = x;
    containers[containerIndex].y = y;
    containers[containerIndex].z = containers.length;
    this.setState({
      containers,
    });
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

  async postContainer(container) {
    const { key } = this.state;
    try {
      const res = await fetch(`/content/${key}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(container),
      });
      return res;
    } catch (err) {
      console.log('fetch error', err);
      return 'ERROR';
    }
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
        key={container.id}
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
              <img src={scanMe} alt="" className="scanMe" />
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
