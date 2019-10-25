import React, { Component } from 'react';
import io from 'socket.io-client';
import logo from '../Assets/cfwhite.png';
import '../App.css';
import PostIt from './PostIt';
import Pointer from './Pointer';

class Display extends Component {
  constructor(props) {
    super(props);

    this.state = {
      texts: [],
      cursor: { x: 0, y: 0 },
      keyChecked: false,
      qr_path : '/qr',
    };
  }

  componentDidMount() {
    const { match: { params: { key } } } = this.props;
    this.checkKey(key);
    const socket = io();
    socket.emit('display');
    socket.on('data', (data) => {
      if (data.length === 2) {
        this.moveCursor(data);
      }
    });

    socket.on('reload_qr', () => {
      const {qr_path} = this.state + '?' + Date.now();
      this.setState(
          qr_path,
      )
    });

    socket.on('posting', (content) => {
      const { texts } = this.state;
      texts.push(content);
      this.setState({
        texts,
      });
    });
    socket.on('remote_click', () => {
      const { cursor: { x, y } } = this.state;
      const {
        left, right, top, bottom,
      } = document.getElementById('post').getBoundingClientRect();
      if (x > left && x < right && y > top && y < bottom) {
        socket.emit('start_posting');
      }
    });
  }

  moveCursor(data) {
    const displacement = data[1] * 0.2;
    const dx = displacement * Math.cos(data[0]);
    const dy = -displacement * Math.sin(data[0]);
    this.setState((state) => ({
      cursor: {
        x: state.cursor.x + dx,
        y: state.cursor.y + dy,
      },
    }));
  }

  checkKey(key) {
    fetch(`/display/${key}`)
      .then((resp) => {
        resp.text()
          .then((txt) => {
            if (txt === 'ok') {
              this.setState({ keyChecked: true });
            } else {
              this.setState({ keyChecked: false });
            }
          })
          .catch(() => {
            this.setState({ keyChecked: false });
          });
      });
  }

  render() {
    const { texts, cursor: { x, y }, keyChecked } = this.state;
    const postits = texts.map((text, index) => <PostIt id={`postit n ${index}`} text={text} />);
    return (
      keyChecked
        ? (
          <div className="Display">
            <header>
              <img src={logo} className="Display-logo" alt="logo" />
              <div id="post" className="post">Poster</div>
            </header>
            {postits}
            <Pointer id="pointer" color="red" x={x} y={y} />
            <footer>
              <img src="/qr" alt="" className="qr" />
            </footer>
          </div>
        ) : (
          <div className="Display" />
        )
    );
  }
}

export default Display;
