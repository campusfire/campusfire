import React, { Component } from 'react';
import ReactNipple from 'react-nipple';
import io from 'socket.io-client';
import logo from '../Assets/logomobile.png';
import '../App.css';

class Mobile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: null,
      distance: 0,
      type: false,
      key: null,
      keyChecked: false,
      backgroundColor: 'inherit',
      timer: null,
      radian: 0,
    };

    this.handleStart = this.handleStart.bind(this);
    this.handleMove = this.handleMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleEnd = this.handleEnd.bind(this);
    this.handlePost = this.handlePost.bind(this);
    this.handleEnterKey = this.handleEnterKey.bind(this);
    this.checkKey = this.checkKey.bind(this);
  }

  async componentDidMount() {
    const { match } = this.props;
    const { params: { key } } = match;
    await this.checkKey(key);
    const { keyChecked } = this.state;
    console.log(keyChecked);
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

      socket.on('set_color', (data) => {
        this.setState({
            backgroundColor: data
        });
        console.log(data);
      });

      this.setState({
        socket,
      });
      socket.emit('storeClientInfo', { clientKey: key });
      socket.emit('cursor', { clientKey: key });
    }
    // }
  }

  handleMove(_, data) {
    const { distance, angle: { radian } } = data;
    this.setState({
      radian,
      distance,
    })
  }

  handleStart(_, data) {
    const { socket, key } = this.state;
    const timer = setInterval(() => {
      const { distance, radian } = this.state;
      if (socket) {
        socket.emit('move', [radian, distance, key]);
      }
    }, 16)
    this.setState({
      timer,
    });
  }

  handleClick() {
    const { socket, distance, key } = this.state;
    if (socket && distance === 0) {
      socket.emit('click', { clientKey: key, clientId: socket.id });
    }
  }

  handleEnd() {
    const { timer } = this.state;
    clearInterval(timer);
    this.setState({
      distance: 0,
      timer,
    });
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
          <div className="Mobile" onClick={this.handleClick} style={{ backgroundColor: this.state.backgroundColor }}>
            <header>
              <img src={logo} className="Mobile-logo" alt="logo" />
            </header>
            <div style={{ display: type ? 'block' : 'none' }}>
              <input id="input" onKeyUp={this.handleEnterKey} />
              <button type="button" onClick={this.handlePost}>Poster</button>
            </div>
            <ReactNipple
              option={{ mode: 'dynamic' }}
              style={{
                flex: '1 1 auto',
                position: 'relative',
              }}
              onStart={this.handleStart}
              onMove={this.handleMove}
              onEnd={this.handleEnd}
            />
          </div>
        ) : (
          <div className="Display" />
        )
    );
  }
}

export default Mobile;
