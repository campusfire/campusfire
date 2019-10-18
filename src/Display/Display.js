import React from 'react';
import socketIo from 'socket.io-client';
import logo from '../Assets/cfwhite.png';
import '../App.css';

class Display extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      texts: [],
      cursor: { x: 0, y: 0 },
    };
  }

  componentDidMount() {
    this.checkKey(this.props.match.params.key);
    const io = socketIo();
    io.on('data', (data) => {
      if (data.length === 2) {
        this.moveCursor(data);
      }
    });
    // io.on('connection', (socket) => {
    //   console.log('connexion client');
    //   socket.on('data', (data) => {
    //     // Will print 'hi!'
    //     console.log('test');
    //     if (data.length === 2) {
    //       this.moveCursor(data);
    //     }
    //   });
    // });
  }

  moveCursor(data) {
    // console.log(data);
    const displacement = data[1] * 0.2;
    const dx = displacement * Math.cos(data[0]);
    const dy = -displacement * Math.sin(data[0]);
    // console.log(dx, dy);
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
            console.log(txt);
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

        </header>

        {postits}

        <Pointer color="red" x={x} y={y} />
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

export default Display;
