import React from 'react';
import { Switch, Route } from 'react-router-dom';
import './App.css';
import Display from './Display/Display';
import Mobile from './Mobile/Mobile';


function App() {
  return (
    <Switch>
      <Route path="/d/:key" component={Display} />
      <Route path="/m/:key" component={Mobile} />
    </Switch>
  );
}

export default App;
