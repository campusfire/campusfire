import React, { Component } from 'react';
import ReactNipple from 'react-nipple';
import Peer from 'peerjs';
import logo from '../Assets/logo.svg';
import '../App.css';


let peer;
let conn;


function checkKey() {
  return true;
}

function handleMove(event, data) {
  if (conn) {
    console.log(data, event);
    conn.send([data.angle.radian, data.distance]);
  }
}

class Mobile extends Component {
  componentDidMount() {
    const { match } = this.props;
    const { params: { key } } = match;
    if (match) {
      checkKey(key);
      peer = new Peer(`cl-${key}`, { host: 'localhost', port: 8080, path: '/peer' });
      conn = peer.connect('borne');
      console.log('peer');
      conn.on('open', () => {
        console.log('connected!');
        conn.send('hi!');
      });
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
          onMove={handleMove}
        />
      </div>
    );
  }
}


export default Mobile;
