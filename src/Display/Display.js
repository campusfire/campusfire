import React from 'react';
import Peer from 'peerjs';
import logo from '../Assets/cfwhite.png';
import '../App.css';

let peer;
let disp;

class Display extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      texts: [],
      cursor: { x: 0, y: 0 },
    };

    disp = this;
  }

  componentDidMount() {
    this.checkKey(this.props.match.params.key);
    console.log('peer');
    peer = new Peer('borne', { host: 'localhost', port: 8080, path: '/peer' });
    peer.on('connection', (conn) => {
      console.log('connexion client');
      conn.on('data', (data) => {
        // Will print 'hi!'
        if (data.length === 2) {
          this.moveCursor(data);
        }
      });
    });
  }

  moveCursor(data) {
    // console.log(data);
    data[1] *= 0.2;
    const dx = data[1] * Math.cos(data[0]);
    const dy = -data[1] * Math.sin(data[0]);
    // console.log(dx, dy);
    console.log(data[0]);
    this.setState((state) => ({
      cursor: {
        x: state.cursor.x + dx,
        y: state.cursor.y + dy,
      },
    }));
  }

  checkKey(key) {
    const _this = this;
    fetch(`/display/${key}`)
      .then((resp) => {
        resp.text()
          .then((txt) => {
            console.log(txt);
            if (txt === 'ok') { _this.setState({ texts: ['Ok'] }); } else { _this.setState({ texts: ['Pas de display'] }); }
          })
          .catch(() => {
            _this.setState({ texts: 'Erreur serveur' });
          });
      });
  }

  render() {
    const postits = [];

    for (const t in this.state.texts) {
      postits.push(<PostIt text={this.state.texts[t]} />);
    }

    const pointer = <Pointer color="red" x={this.state.cursor.x} y={this.state.cursor.y} />;

    return (
      <div className="Display">
        <header>
          <img src={logo} className="Display-logo" alt="logo" />

        </header>

        {postits}

        {pointer}
      </div>
    );
  }
}

function PostIt(props) {
  console.log(props);
  return (
    <div className="postit">
      {props.text}
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
