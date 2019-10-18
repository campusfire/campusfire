import React, { Component } from 'react';
import ReactNipple from 'react-nipple';
import io from 'socket.io-client';
import logo from '../Assets/logo.svg';
import '../App.css';

function checkKey() {
  return true;
}

class Mobile extends Component {
  constructor() {
    super();
    this.state = {
      socket: null,
    };

    this.handleMove = this.handleMove.bind(this);
  }

  componentDidMount() {
    const { match } = this.props;
    const { params: { key } } = match;
    if (match) {
      checkKey(key);
      const socket = io();
      this.setState({
        socket,
      });
    }
  }

  handleMove(event, data) {
    const { socket } = this.state;
    if (socket) {
      socket.emit('move', [data.angle.radian, data.distance]);
    }
  }

  render() {
    return (
      <div className="Display">
        <header>
          <img src={logo} className="Display-logo" alt="logo" />
        </header>
        <ReactNipple
          option={{ mode: 'dynamic' }}
          style={{
            flex: '1 1 auto',
            position: 'relative',
          }}
          onMove={this.handleMove}
        />
      </div>
    );
  }
}


export default Mobile;
