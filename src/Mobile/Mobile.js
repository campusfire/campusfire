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
      longPressTimer: null,
      mode: 'dynamic',
    };
    this.longPressed = false;
    this.radialOption = '';
    this.threshold = 10;

    this.handleMove = this.handleMove.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
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
  }

  handleMove(_, data) {
    const { distance, angle: { radian, degree }, mode } = data;
    this.setState({
      radian,
      distance,
      degree
    });
  }

  handleRadialOptionChange(angle) {
    const { socket, key, distance } = this.state;
    let element = '';
    if (distance > this.threshold) {
      switch (true) {
        case angle >= 0 && angle < 90:
          element = 'pieSliceImage';
          break;
        case angle >= 90 && angle < 180:
          element = 'pieSliceText';
          break;
        case angle >= 180 && angle < 270:
          element = 'pieSliceVideo';
          break;
        case angle >= 270 && angle < 360:
          element = 'pieSliceOther';
          break;
        default:
          element = 'innerCircle';
          break;
      }
    } else {
      element = 'innerCircle';
    }
    if (this.radialOption !== element) {
      socket.emit('dir', [element, key]);
      this.radialOption = element;
    }
  }

  handleTouchStart(e) {
    const { socket, key } = this.state;
    const timer = setInterval(() => {
      const { distance, radian, degree } = this.state;
      if (socket) {
        if (mode === 'dynamic') {
          socket.emit('move', [radian, distance, key]);
        } else if (!this.longPressed) {
          this.handleRadialOptionChange(degree);
        }
      }
    }, 16)
    this.setState({
      timer,
      longPressTimer: setTimeout(() => this.handleLongPress(e), 1300),
    });
  }

  handleLongPress(e) {
    const { socket, key, distance, longPressTimer } = this.state;
    if (distance <= this.threshold) {
      socket.emit('debug', 'long press');
      e.preventDefault();
      clearTimeout(longPressTimer);
      this.setState({ mode: 'static' });
      this.longPressed = true;
      window.navigator.vibrate(200);
      socket.emit('longPress', { clientKey: key, clientId: socket.id });
    }
  }

  handleTouchEnd() {
    const { socket, distance, key, longPressTimer, mode, timer } = this.state;
    clearInterval(timer);
    socket.emit('debug', `touch end, longPressed: ${this.longPressed}`);
    if (socket) {
      if (mode === 'dynamic' && distance === 0) {
        socket.emit('click', { clientKey: key, clientId: socket.id });
      } else if (mode === 'static' && !this.longPressed) {
        if (distance === 0) {
          socket.emit('debug', 'close radial');
          socket.emit('closeRadial', { clientKey: key, clientId: socket.id });
          this.setState({ mode: 'dynamic' });
        } else {
          socket.emit('selectedPostType', { clientKey: key, clientId: socket.id });
          this.setState({ mode: 'dynamic' });
        }
      }
    }
    this.setState({
      distance: 0,
      timer,
    });
    if (this.longPressed) {
      this.longPressed = false;
    }
    clearTimeout(longPressTimer);
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
    const { type, keyChecked, mode } = this.state;
    return (
      keyChecked
        ? (
          <div className="Mobile" onTouchStart={this.handleTouchStart} onTouchEnd={this.handleTouchEnd} style={{ backgroundColor: this.state.backgroundColor }}>
            <header>
              <img src={logo} className="Mobile-logo" alt="logo" />
            </header>
            <div style={{ display: type ? 'block' : 'none' }}>
              <input id="input" onKeyUp={this.handleEnterKey} />
              <button type="button" onClick={this.handlePost}>Poster</button>
            </div>
            <ReactNipple
              option={{ mode, threshold: this.threshold }}
              style={{
                flex: '1 1 auto',
                position: 'relative',
              }}
              onMove={this.handleMove}
            />
          </div>
        ) : (
          <div className="Display" />
        )
    );
  }
}

export default Mobile;
