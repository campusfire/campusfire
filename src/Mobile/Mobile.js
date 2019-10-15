import React, { Component } from 'react';
import ReactNipple from 'react-nipple';
import Peer from 'peerjs';
import logo from '../Assets/logo.svg';
import '../App.css';

function checkKey() {
  return true;
}

class Mobile extends Component {
  constructor() {
    super();
    this.state = {
      conn: null,
    };

    this.handleMove = this.handleMove.bind(this);
  }

  componentDidMount() {
    const { match } = this.props;
    const { params: { key } } = match;
    if (match) {
      checkKey(key);
      const peer = new Peer(`cl-${key}`, { host: 'localhost', port: 8080, path: '/peer' });
      const conn = peer.connect('borne');
      console.log('peer');
      conn.on('open', () => {
        console.log('connected!');
        conn.send('hi!');
      });
      this.setState({
        conn,
      });
    }
  }

  handleMove(event, data) {
    const { conn } = this.state;
    if (conn) {
      console.log(data, event);
      conn.send([data.angle.radian, data.distance]);
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
