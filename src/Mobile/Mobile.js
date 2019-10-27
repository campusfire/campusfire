import React, { Component } from 'react';
import ReactNipple from 'react-nipple';
import io from 'socket.io-client';
import logo from '../Assets/logo.svg';
import '../App.css';

class Mobile extends Component {
  constructor() {
    super();
    this.state = {
      socket: null,
      distance: 0,
      type: false,
      key: null,
      keyChecked: false,
    };

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
    if (match) {
      this.state.key = key;
      console.log(key);
     await this.checkKey(key);
     console.log(this.state.keyChecked);
     if (this.state.keyChecked) {
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
       socket.emit('storeClientInfo', {clientKey: key});
       socket.emit('cursor', {clientKey: key});
     }
    }
  }


  handleMove(_, data) {
    const { socket, key } = this.state;
    if (socket) {
      socket.emit('move', [data.angle.radian, data.distance, key]);
    }
    this.setState({
      distance: data.distance,
    });
  }

  handleClick() {
    const { socket, distance, key } = this.state;
    if (socket && distance === 0) {
      socket.emit('click', {clientKey: key, clientId: socket.id });
    }
  }

  handleEnd() {
    this.setState({
      distance: 0,
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
     return new Promise((resolve) => {
       fetch(`/mobile/${key}`)
           .then((resp) => {
             resp.text()
                 .then((txt) => {
                   if (txt === 'ok') {
                     this.setState({keyChecked: true});
                   } else {
                     this.setState({keyChecked: false});
                   }
                   resolve(true);
                 })
                 .catch(() => {
                   this.setState({keyChecked: false});
                 });
           });
     });
  }

  render() {
    const { type, keyChecked } = this.state;
    return (
      keyChecked
        ? (
          <div className="Display" onClick={this.handleClick}>
            <header>
              <img src={logo} className="Display-logo" alt="logo" />
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
