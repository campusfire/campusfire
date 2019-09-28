import React from 'react';
import './App.css';

import Display from './Display';

import { Switch, Route } from "react-router-dom";
import Mobile from "./Mobile";


class App extends React.Component {
  constructor(props){
    super(props);

    fetch('/ping').then(function(resp){
      resp.text().then(txt => console.log(txt));
    })
  }

  render(){
    return (
        <Switch>
          <Route path="/display/:key" component={Display} />

          <Route path="/">
            <Mobile />
          </Route>
        </Switch>
        /*<div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>*/
    );
  }

}


export default App;
