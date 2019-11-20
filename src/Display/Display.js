import React, { Component } from 'react';
import io from 'socket.io-client';
import logo from '../Assets/cfwhite.png';
import '../App.css';
import PostIt from './PostIt';
import Pointer from './Pointer';

const getText = async () => fetch('/postit.json', {
  method: 'GET',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
}).then((data) => data.json())
  .then((object) => object)
  .catch((err) => Promise.reject(err));

class Display extends Component {
  constructor(props) {
    super(props);

    this.state = {
      texts: [],
      cursor: {},
      keyChecked: false,
      qrPath: '/qr',
      color: {
        red: false, yellow: false, purple: false, pink: false,
      },
      socket: null,
    };
  }

  async componentDidMount() {
    const { match: { params: { key } } } = this.props;
    await this.checkKey(key);
    const { keyChecked, color } = this.state;
    if (keyChecked) {
      // load from back
      const { texts } = this.state;
      const postits = await getText();
      postits.text.forEach(({ content }) => { texts.push(content); });
      this.setState({ texts });

      // socket
      const socket = io();
      this.socket = socket;

      socket.emit('display');

      socket.on('client_list', (clients) => { // refresh cursors on page reloads
        const { cursor } = this.state;
        clients.forEach((client) => {
          if (client.clientId) {
            cursor[client.clientKey] = { x: 0, y: 0, color: this.pickColor() };
          }
        });
        this.setState({
          cursor,
        });
      });

      socket.on('data', (data) => { //  to move cursor
        this.moveCursor(data);
      });

      socket.on('displayCursor', (senderKey) => { //  to display cursor on user connection
        const { cursor } = this.state;
        if (senderKey != null) {
          cursor[senderKey] = { x: 0, y: 0, color: this.pickColor() };
          this.setState({
            cursor,
          });
        }
        console.log(cursor);
      });

      socket.on('disconnect_user', (senderKey) => { //  removes cursor when user disconnects
        const { cursor } = this.state;
        if (cursor[senderKey]) {
          color[cursor[senderKey].color] = false;
          delete cursor[senderKey];
          this.setState({ cursor });
        }
      });

      socket.on('reload_qr', () => { //  reload qr on user connection
        let { qrPath } = this.state;
        qrPath += `?${Date.now()}`;
        this.setState({
          qrPath,
        });
      });

      socket.on('posting', async (content) => {
        texts.push(content); //   front
        await this.postText(content); //  back
        this.setState({
          texts,
        });
      });

      socket.on('remote_click', (data) => {
        const { cursor } = this.state;
        const { x, y } = cursor[data.clientKey];
        const {
          left, right, top, bottom,
        } = document.getElementById('post').getBoundingClientRect();
        if (x > left && x < right && y > top && y < bottom) {
          socket.emit('start_posting', data.clientId);
        }
      });
    }
  }

  pickColor() { // définir une couleur pour l'utilisateur qui dure jusqu'à ce qu'il se déconnecte
    const { color } = this.state;
    const colors = Object.entries(color); // [['red',false],...,['purple',false]]
    for (let i = 0, len = colors.length; i < len; ++i) {
      if (colors[i][1] === false) {
        color[colors[i][0]] = true;
        return colors[i][0];
      }
    }
    return 'red'; // par défaut
  }

  moveCursor(data) {
    const { dx, dy, key } = data;
    console.log(dx, dy);
    const { cursor } = this.state;
    let { x, y } = cursor[key];

    if (key !== null) {
      x += dx;
      y += dy;
    }
    const {
      left, right, top, bottom,
    } = document.getElementById('root').getBoundingClientRect();
    if (x < left || x > right) {
      x -= dx;
    }
    if (y < top || y > bottom) {
      y -= dy;
    }
    cursor[key].x = x;
    cursor[key].y = y;
    this.setState({
      cursor,
    });
  }

  postText(content) {
    const { texts } = this.state;
    return fetch('/postit.json', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: texts.length, content }),
    });
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
      texts, cursor, keyChecked, qrPath,
    } = this.state;
    // console.log(Object.entries(cursor));
    const postits = texts.map((text, index) => <PostIt id={`postit n ${index}`} text={text} />);
    const cursors = Object.entries(cursor).map(
      ([key, object]) => (
        <Pointer
          key={key}
          id={key}
          color={object.color}
          x={object.x}
          y={object.y}
        />
      ),
    );
    // console.log(cursors);
    return (
      keyChecked
        ? (
          <div className="Display">
            <header>
              <img src={logo} className="Display-logo" alt="logo" />
              <div id="post" className="post">Poster</div>
            </header>
            {postits}
            {cursors}
            <footer>
              <img src={qrPath} alt="" className="qr" />
            </footer>
          </div>
        ) : (
          <div className="Display" />
        )
    );
  }
}

export default Display;
