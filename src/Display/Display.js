import React from 'react';
import io from 'socket.io-client';
import logo from '../Assets/cfwhite.png';
import '../App.css';
import PostIt from './PostIt';
import Pointer from './Pointer';

class Display extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      socket: null,
      texts: [],
      cursor: { x: 0, y: 0 },
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
    this.setState({
      socket,
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
      }
    }));
  }

  checkKey(key) {
    fetch(`/display/${key}`)
      .then((resp) => {
        resp.text()
          .then((txt) => {
            if (txt === 'ok') {
              this.setState({ texts: ['Ok'] });
            } else {
              this.setState({ texts: ['Pas de display'] });
            }
          })
          .catch(() => {
            this.setState({ texts: 'Erreur serveur' });
          });
      });
  }

  render() {
    const { texts, cursor: { x, y } } = this.state;
    const postits = texts.map((text) => <PostIt text={text} />);
    return (
      <div className="Display">
        <header>
          <img src={logo} className="Display-logo" alt="logo" />
          <div id="post" style={{ backgroundColor: 'green', width: '50px', height: '50px' }} />
        </header>

        {postits}
        <Pointer id="pointer" color="red" x={x} y={y} />

        <Pointer color="red" x={x} y={y} />

        <footer>
          <Qr image = "/qr"/>
        </footer>

      </div>
    );
  }
}

function PostIt(props) {
  const { text } = props;
  console.log(props);
  return (
    <div className="postit">
      {text}
    </div>
  );
}

function Pointer(props) {
  const { color, x, y } = props;
  return (
    <div
      className="pointer"
      style={{
        backgroundColor: color,
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
      }}
    />
  );
}

function Qr(props){
  const { image } = props;
  return (
      <img src= {image} className="qr"/>

  )
}

export default Display;
