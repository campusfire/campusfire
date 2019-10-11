import React from 'react';
import ReactNipple from 'react-nipple';
import logo from './logo.svg';
import Peer from 'peerjs';
import './App.css';


let peer;
let conn;



class Mobile extends React.Component {
  /*constructor(props){
    super(props);


  }*/

    componentDidMount(){
        if(this.props.match) {
            this.checkKey(this.props.match.params.key);
            peer = new Peer('cl-'+this.props.match.params.key, {host: 'localhost', port: 8080, path: '/peer'});
            conn = peer.connect('borne');
            console.log('peer');

            conn.on('open', function(){
                console.log('connected!');
                conn.send('hi!');

            })
        }
    }

    checkKey(cle){
        return true;
    }

    handleMove(_, data) {
        //console.log(data);
        if(conn){
            conn.send([data.angle.radian, data.distance]);
        }
    }

    render(){
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
