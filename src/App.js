import React from 'react';
import './App.css';

import { Switch, Route } from 'react-router-dom';
import Display from './Display/Display';

import Mobile from './Mobile/Mobile';


class App extends React.Component {
  // constructor(props){
  //   super(props);
  // }

  render() {
    return (
      <Switch>
        <Route path="/d/:key" component={Display} />

        <Route path="/m/:key" component={Mobile} />

        <Route path="/">
          <Mobile />
        </Route>
      </Switch>
    );
  }
}


export default App;
