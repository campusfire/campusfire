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
      cursor: {},
      keyChecked: false,
      qr_path : '/qr',
      color: {'red':false, 'yellow':false, 'purple':false, 'pink':false},
    };
  }

  async componentDidMount() {
    const { match: { params: { key } } } = this.props;
    await this.checkKey(key);
    if (this.state.keyChecked) {
      const socket = io();
      socket.emit('display');

      socket.on('data', (data) => {
        if (data.length === 3) {
          this.moveCursor(data);
        }
      });

      socket.on('displayCursor', (key) => {
        let {cursor} = this.state;
        if (key != null) {
          cursor[key] = {x: 0, y: 0, color: this.pickColor()};
          this.setState({
            cursor,
          });
        }
        console.log(cursor);
      });

      socket.on('disconnect_user', (key) => {
        const {cursor} = this.state;
        if (cursor[key]) {
          this.state.color[cursor[key].color] = false;
          delete cursor[key];
          this.setState({cursor});
        }
      });

      socket.on('reload_qr', () => {
        let {qr_path} = this.state;
        qr_path += '?' + Date.now();
        this.setState({
              qr_path,
            }
        );
      });

      socket.on('posting', (content) => {
        const {texts} = this.state;
        texts.push(content);
        this.setState({
          texts,
        });
      });

      socket.on('remote_click', (data) => {
        const {x, y} = this.state.cursor[data.clientKey];
        const {
          left, right, top, bottom,
        } = document.getElementById('post').getBoundingClientRect();
        if (x > left && x < right && y > top && y < bottom) {
          socket.emit('start_posting', data.clientId);
        }
      });
    }
  }

  moveCursor(data) {
    const displacement = data[1] * 0.2;
    const key = data[2];
    console.log(key);
    const dx = displacement * Math.cos(data[0]);
    const dy = -displacement * Math.sin(data[0]);
    let {cursor} = this.state;
    let {x,y} = cursor[key];

    if (key !== null) {
      x += dx;
      y += dy;
    }
    const {
      left, right, top, bottom,
    } = document.getElementById('root').getBoundingClientRect();
    if (x<left || x>right){
      x -= dx;
    }
    if (y<top || y>bottom){
      y -= dy;
    }
    cursor[key].x = x;
    cursor[key].y = y;
    this.setState({
          cursor,
        }
    );
  }

  pickColor(){  // définir une couleur pour l'utilisateur qui dure jusqu'à ce qu'il se déconnecte
    const color = Object.entries(this.state.color); // [['red',false],...,['purple',false]]
    for (let i=0, len = color.length; i<len; ++i){
      if (color[i][1] === false){
        this.state.color[color[i][0]] = true;
        return color[i][0];
      }
    }
    return 'red'; // par défaut
  }

  checkKey(key) {
      return fetch(`/display/${key}`)
          .then((resp) => {
            return resp.text()
                .then((txt) => {
                  if (txt === 'ok') {
                    this.setState({keyChecked: true});
                  } else {
                    this.setState({keyChecked: false});
                  }
                })
                .catch(() => {
                  this.setState({keyChecked: false});
                });
          });
    }

  render() {
    const { texts, cursor, color, keyChecked, qr_path } = this.state;
    //console.log(Object.entries(cursor));
    const postits = texts.map((text, index) => <PostIt id={`postit n ${index}`} text={text} />);
    const cursors = Object.entries(cursor).map(([key, object],index,cursor) => <Pointer key = {key} id={key} color={object.color} x={object.x} y={object.y} />);
    //console.log(cursors);
    return (
      keyChecked
        ? (
          <div className="Display">
            <header>
              <img src={logo} className="Display-logo" alt="logo" />
              <div id="post" className="post">Poster</div>
            </header>
            {postits}
            {cursors}
            <ToastContainer className='toast-container'
                            toastClassName="dark-toast"
                            progressClassName={css({
                              height: "2px"
                            })}/>
            <footer>
              <img src={qr_path} alt="" className="qr" />
            </footer>
          </div>
        ) : (
          <div className="Display" />
        )
    );
  }
}

export default Display;
