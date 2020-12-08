import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

import Games from './Games';
import Game from './Game';
import Card from './Card';
import Login from './Login';
import Logout from './Logout';
import BingoApi from './server/BingoApi';

const PrivateRoute = ({
  component: Component,
  ...rest
}) => (

  <Route
    {...rest}
    render={(props) => (BingoApi.isLoggedIn()
    ? <Component {...props}/>
    : <Redirect
      to={{
      pathname: '/login',
      state: {
        from: props.location
      }
    }}/>)}/>

)



export default function App() {
    return (
      <Router>
          {/* A <Switch> looks through its children <Route>s and
              renders the first one that matches the current URL. */}
          <Switch>
            <Route exact path="/login" component={Login} />
            <PrivateRoute exact path="/" component={Games} />
            <PrivateRoute exact path="/game/:id" component={Game} />
            <PrivateRoute exact path="/game/:id/card" component={Card} />
            <PrivateRoute exact path="/logout" component={Logout} />
          </Switch>
      </Router>
    );
}
