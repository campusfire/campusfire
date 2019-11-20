import React, { Component } from 'react';
import io from 'socket.io-client';
import logo from '../Assets/logomobile.png';
import '../App.css';

class Mobile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: null,
      x: null,
      y: null,
      type: false,
      key: null,
      keyChecked: false,
    };

    this.handleClick = this.handleClick.bind(this);
    this.handlePost = this.handlePost.bind(this);
    this.handleEnterKey = this.handleEnterKey.bind(this);
    this.checkKey = this.checkKey.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
  }

  async componentDidMount() {
    const { match } = this.props;
    const { params: { key } } = match;
    await this.checkKey(key);
    const { keyChecked } = this.state;
    console.log(keyChecked);
    // if (match) {
    console.log(key);
    if (keyChecked) {
      this.setState({
        key,
      });
      const socket = io();
      console.log(socket);

      socket.on('start_posting', () => {
        this.setState({
          type: true,
        });
        document.getElementById('input').focus();
      });

      this.setState({
        socket,
      });
      socket.emit('storeClientInfo', { clientKey: key });
      socket.emit('cursor', { clientKey: key });
    }
    // }
  }

  handleTouchMove(event) {
    event.preventDefault();
    const {
      socket, key, x, y,
    } = this.state;
    // socket.emit('debug', event);
    if (socket && x !== null && y !== null) {
      socket.emit('touchMove', { dx: event.touches[0].clientX - x, dy: event.touches[0].clientY - y, key });
    }
    this.setState({
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    });
  }

  handleClick() {
    const { socket, key } = this.state;
    if (socket) {
      socket.emit('click', { clientKey: key, clientId: socket.id });
    }
  }

  handlePost(event) {
    const { socket } = this.state;
    event.stopPropagation();
    const input = document.getElementById('input');
    if (input.value !== '') {
      socket.emit('posting', input.value);
    }
    input.value = '';
    this.setState({
      type: false,
    });
  }

  handleEnterKey(event) {
    if (event.keyCode === 13) { this.handlePost(event); }
  }

  checkKey(key) {
    return fetch(`/mobile/${key}`)
      .then((resp) => resp.text()
        .then((txt) => {
          if (txt === 'ok') {
            this.setState({ keyChecked: true });
          } else {
            this.setState({ keyChecked: false });
          }
        })
        .catch(() => {
          this.setState({ keyChecked: false });
        }));
  }

  render() {
    const { type, keyChecked } = this.state;
    return (
      keyChecked
        ? (
          <div className="Mobile" onClick={this.handleClick} onTouchMove={this.handleTouchMove}>
            <header>
              <img src={logo} className="Mobile-logo" alt="logo" />
            </header>
            <div style={{ display: type ? 'block' : 'none' }}>
              <input id="input" onKeyUp={this.handleEnterKey} />
              <button type="button" onClick={this.handlePost}>Poster</button>
            </div>
          </div>
        ) : (
          <div className="Display" />
        )
    );
  }
}

export default Mobile;
