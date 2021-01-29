import React from 'react';
import './App.css';

import { Switch, Route } from 'react-router-dom';
import Display from './Display/Display';
import Mobile from './Mobile/Mobile';
//import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import { createMuiTheme, ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';


function App() {
  // constructor(props){
  //   super(props);
  // }
    const theme = createMuiTheme({
      status: {
      },
    });

  return (
    <MuiThemeProvider theme={theme}>
        <Switch>
          <Route path="/d/:key" component={Display} />

          <Route path="/m/:key" component={Mobile} />

          <Route path="/">
            <Mobile />
            </Route>
        </Switch>
    </MuiThemeProvider>

  );
}


export default App;
