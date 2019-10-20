import React, { Component } from 'react';
import ReactNipple from 'react-nipple';
import io from 'socket.io-client';
import logo from '../Assets/logo.svg';
import hax from '../Assets/hax.jpg';
import kek from '../Assets/kek.mp3';
import '../App.css';

class Mobile extends Component {
  constructor() {
    super();
    this.state = {
      socket: null,
      distance: 0,
      type: false,
    };

    this.handleMove = this.handleMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleEnd = this.handleEnd.bind(this);
    this.handlePost = this.handlePost.bind(this);
    this.handleEnterKey = this.handleEnterKey.bind(this);
  }

  componentDidMount() {
    const { match } = this.props;
    const { params: { key } } = match;
    fetch(`/mobile/${key}`)
        .then((resp) => {
          resp.text()
              .then((txt) => {
                let init = txt === 'ok';
                if (match && init) {
                  const socket = io();
                  socket.emit('storeClientInfo', {clientKey : key, clientId: this.state.socket});
                  socket.emit('cursor');
                  socket.on('start_posting', () => {
                    this.setState({
                      type: true,
                    });
                    document.getElementById('input').focus();
                  });
                  this.setState({
                    socket,
                  });
                  console.log(this.state.socket);
                }
              });
        });
  }


  handleMove(_, data) {
    const { socket } = this.state;
    if (socket) {
      socket.emit('move', [data.angle.radian, data.distance]);
    }
    this.setState({
      distance: data.distance,
    });
  }

  handleClick() {
    const { socket, distance } = this.state;
    if (socket && distance === 0) {
      socket.emit('click');
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

  render() {
    const { type } = this.state;
    if (this.state.socket != null) {
      return (
          <div className="Mobile" onClick={this.handleClick}>
            <header>
              <img src={logo} className="Display-logo" alt="logo"/>
            </header>
            <div style={{display: type ? 'block' : 'none'}}>
              <input id="input" onKeyUp={this.handleEnterKey}/>
              <button onClick={this.handlePost}>Poster</button>
            </div>
            <ReactNipple
                option={{mode: 'dynamic'}}
                style={{
                  flex: '1 1 auto',
                  position: 'relative',
                }}
                onMove={this.handleMove}
                onClick={this.handleEnd}
            />
          </div>
      );
    }
    else{
      return(
          <div className="MobileError">
            <img src={hax} className = "hax"/>
            <audio autoPlay>
              <source src={kek} type="audio/mp3"/>

            </audio>
          </div>
      )
    }
  }
}

export default Mobile;
