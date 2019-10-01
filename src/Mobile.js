import React from 'react';
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

    render(){
        return (
            <div className="Display">
                <header>
                    <img src={logo} className="Display-logo" alt="logo" />

                </header>
            </div>
        );
    }

}


export default Mobile;
