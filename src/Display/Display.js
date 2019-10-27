import React, { Component } from 'react';
import io from 'socket.io-client';
import logo from '../Assets/cfwhite.png';
import '../App.css';
import PostIt from './PostIt';
import Pointer from './Pointer';
import {toast, ToastContainer} from "react-toastify";
import { css } from 'glamor';

toast.configure();
const notify_in = () => toast("Someone just joined!");
const notify_out = () => toast("Someone logged out!");

class Display extends Component {

  constructor(props) {
    super(props);

    this.state = {
      texts: [],
      cursor: {},
      keyChecked: false,
      qr_path : '/qr',
      color: ['red', 'yellow', 'purple', 'pink'],
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
          cursor[key] = {x: 0, y: 0};
          this.setState({
            cursor,
          });
          notify_in();
        }
        console.log(cursor);
      });

      socket.on('disconnect_user', (key) => {
        const {cursor} = this.state;
        delete cursor[key];
        this.setState({cursor});
        notify_out();
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
    if (key !== null) {
      cursor[key].x += dx;
      cursor[key].y += dy;
    }
    this.setState({
      cursor,
      }
    );
  }

  checkKey(key) {
    return new Promise((resolve) => {
      fetch(`/display/${key}`)
          .then((resp) => {
            resp.text()
                .then((txt) => {
                  if (txt === 'ok') {
                    this.setState({keyChecked: true});
                  } else {
                    this.setState({keyChecked: false});
                  }
                  resolve(key);
                })
                .catch(() => {
                  this.setState({keyChecked: false});
                });
          });
    });
  }

  render() {
    const { texts, cursor, color, keyChecked, qr_path } = this.state;
    //console.log(Object.entries(cursor));
    const postits = texts.map((text, index) => <PostIt id={`postit n ${index}`} text={text} />);
    const cursors = Object.entries(cursor).map(([key, object],index,cursor) => <Pointer key = {key} id={key} color={color[index]} x={object.x} y={object.y} />);
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
