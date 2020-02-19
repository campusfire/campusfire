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
      key: null,
      keyChecked: false,
      backgroundColor: 'inherit',
      timer: null,
      radian: 0,
      longPressTimer: null,
      mode: 'dynamic',
      input: false,
      file: null,
    };
    this.postType = null;
    this.longPressed = false;
    this.radialOption = '';
    this.threshold = 15;

    this.handleMove = this.handleMove.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.onFileChange = this.onFileChange.bind(this);
    this.handlePost = this.handlePost.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleEnterKey = this.handleEnterKey.bind(this);
    this.checkKey = this.checkKey.bind(this);
  }

  async componentDidMount() {
    const { match } = this.props;
    const { params: { key } } = match;
    await this.checkKey(key);
    const { keyChecked } = this.state;
    if (keyChecked) {
      this.setState({
        key,
      });
      const socket = io();

      socket.on('radial_open', () => {
        this.setState({ mode: 'static' });
        this.longPressed = true;
      });

      socket.on('dragging_container', () => {
        this.longPressed = true;
      });

      socket.on('set_color', (data) => {
        this.setState({
          backgroundColor: data,
        });
      });

      socket.on('disconnect', () => {
        this.setState({
          socket: null,
        });
      });

      this.setState({
        socket,
      });
      socket.emit('store_client_info', { clientKey: key });
      socket.emit('cursor', { clientKey: key });
    }
  }

  onFileChange(e) {
    this.setState({ file: e.target.files[0] });
  }

  handleMove(_, data) {
    const { distance, angle: { radian, degree } } = data;
    this.setState({
      radian,
      distance,
      degree,
    });
  }

  handleRadialOptionChange(angle) {
    const { socket, key, distance } = this.state;
    let element;
    if (distance > this.threshold) {
      switch (true) {
        case angle >= 0 && angle < 90:
          element = 'Image';
          break;
        case angle >= 90 && angle < 180:
          element = 'Text';
          break;
        case angle >= 180 && angle < 270:
          element = 'Video';
          break;
        case angle >= 270 && angle < 360:
          element = 'Other';
          break;
        default:
          element = 'None';
          break;
      }
    } else {
      element = 'None';
    }
    this.postType = element;
    if (this.radialOption !== element) {
      socket.emit('dir', [element, key]);
      this.radialOption = element;
    }
  }

  createMoveInterval() {
    const { socket, key } = this.state;
    let { timer } = this.state;
    clearInterval(timer);
    timer = setInterval(() => {
      const { distance, radian, degree } = this.state;
      if (socket) {
        if (!this.longPressed) {
          socket.emit('move', [radian, distance, key]);
          if (distance > this.threshold) {
            socket.emit('stop_pressing', { clientKey: key, clientId: socket.id });
          }
        } else {
          this.handleRadialOptionChange(degree);
        }
      }
    }, 50);

    this.setState({ timer });
  }

  handleTouchStart(e) {
    const { socket, key } = this.state;
    // socket.emit('debug', 'touch start');
    if (socket && !this.longPressed) {
      socket.emit('pressing', { clientKey: key, clientId: socket.id });
    }
    this.createMoveInterval();
    const longPressTimer = setTimeout(() => this.handleLongPress(e), 1000);
    this.setState({
      longPressTimer,
    });
  }

  handleLongPress(e) {
    const {
      socket, key, distance, longPressTimer,
    } = this.state;
    if (socket && distance <= this.threshold) {
      // socket.emit('debug', 'long press');
      e.preventDefault();
      clearTimeout(longPressTimer);
      // window.navigator.vibrate(200);
      socket.emit('long_press', { clientKey: key, clientId: socket.id });
    }
  }

  handleTouchEnd() {
    const {
      socket, distance, key, longPressTimer, timer,
    } = this.state;
    clearInterval(timer);
    // socket.emit('debug', 'touch end');
    if (socket) {
      socket.emit('stop_pressing', { clientKey: key, clientId: socket.id });
      if (!this.longPressed && distance === 0) {
        socket.emit('click', { clientKey: key, clientId: socket.id });
      } else if (this.longPressed) {
        if (distance <= this.threshold) {
          // socket.emit('debug', 'close radial');
          socket.emit('close_radial', { clientKey: key, clientId: socket.id });
        } else {
          this.setState({ input: true });
          socket.emit('selected_post_type', { clientKey: key, clientId: socket.id });
        }
        this.setState({ mode: 'dynamic' });
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
    const { socket, key, file } = this.state;
    event.stopPropagation();
    const { postType } = this;
    const input = document.getElementById(`${postType.toLowerCase()}Input`);
    switch (this.postType) {
      case 'Other':
      case 'Text':
        if (input.value !== '') {
          socket.emit('posting', { contentType: 'TEXT', content: input.value, clientKey: key });
        }
        input.value = '';
        break;
      case 'Video':
      case 'Image':
        if (file) {
          socket.emit('debug', `file: ${file.name}`);
          const formData = new FormData();
          formData.append('file', file);
          fetch(`/storage/${key}`, {
            method: 'POST',
            body: formData,
          })
            // .then(this.handleErrors)
            .then((response) => response.text())
            .then((data) => {
              socket.emit('posting', { contentType: postType.toUpperCase(), content: data, clientKey: key });
            })
            .catch((err) => socket.emit('debug', `err: ${err}`));
        } else {
          socket.emit('debug', 'no file');
        }
        break;
      default:
        break;
    }
    this.setState({ input: false });
    this.postType = null;
  }

  handleCancel(event) {
    const { socket, key } = this.state;
    event.stopPropagation();
    const input = document.getElementById(`${this.postType.toLowerCase()}Input`);
    input.value = '';
    this.setState({ file: null, input: false });
    this.postType = null;
    if (socket) {
      socket.emit('cancel', { clientKey: key, clientId: socket.id });
    }
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
    const {
      keyChecked, mode, backgroundColor, input,
    } = this.state;
    return (
      keyChecked
        ? (
          <div className="Mobile" onTouchStart={!input ? this.handleTouchStart : false} onTouchEnd={!input ? this.handleTouchEnd : false} style={{ backgroundColor }}>
            <header>
              <img src={logo} className="Mobile-logo" alt="logo" />
            </header>
            <table style={{ display: input && this.postType === 'Text' ? 'block' : 'none' }}>
              <tr>
                <td>
                  <textarea id="textInput" onKeyUp={this.handleEnterKey} maxLength="130" wrap={false} cols="25" rows="3" />
                </td>
                <td>
                  <button type="button" onClick={this.handlePost}>Poster</button>
                  <button type="button" onClick={this.handleCancel}>X</button>
                </td>
              </tr>
            </table>
            <div style={{ display: input && this.postType === 'Image' ? 'block' : 'none' }}>
              <input id="imageInput" type="file" accept="image/*" onChange={this.onFileChange} />
              <button type="button" onClick={this.handlePost}>Poster</button>
              <button type="button" onClick={this.handleCancel}>X</button>
            </div>
            <div style={{ display: input && this.postType === 'Video' ? 'block' : 'none' }}>
              <input id="videoInput" type="file" accept="video/*" onChange={this.onFileChange} />
              <button type="button" onClick={this.handlePost}>Poster</button>
              <button type="button" onClick={this.handleCancel}>X</button>
            </div>
            <table style={{ display: input && this.postType === 'Other' ? 'block' : 'none' }}>
              <tr>
                <td>
                  <textarea id="otherInput" onKeyUp={this.handleEnterKey} maxLength="130" wrap={false} cols="25" rows="3" />
                </td>
                <td>
                  <button type="button" onClick={this.handlePost}>Poster</button>
                  <button type="button" onClick={this.handleCancel}>X</button>
                </td>
              </tr>
            </table>
            {!input
              && (
                <ReactNipple
                  option={{ mode, threshold: this.threshold }}
                  style={{
                    flex: '1 1 auto',
                    position: 'relative',
                  }}
                  onMove={this.handleMove}
                />
              )}
          </div>
        ) : (
          <div className="Display" />
        )
    );
  }
}

export default Mobile;
