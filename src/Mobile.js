import React from 'react';
import ReactNipple from 'react-nipple';
import logo from './logo.svg';
import './App.css';


class Mobile extends React.Component {
  /*constructor(props){
    super(props);


  }*/

    componentDidMount(){
        if(this.props.match)
            this.checkKey(this.props.match.params.key);
    }

    checkKey(cle){
        return true;
    }

    handleMove(_, data) {
        console.log(data.angle.degree);
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
