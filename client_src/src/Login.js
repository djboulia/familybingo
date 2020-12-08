import React from 'react';
import { Redirect } from 'react-router-dom'
import { Button, TextField } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Alert from '@material-ui/lab/Alert';
import Dashboard from './Dashboard';
import Title from './Title';
import BingoApi from './server/BingoApi';

const statusMsg = (msg) => {
  <Alert severity="info">{msg}</Alert>
}

const errorMsg = (msg) => {
  return <Alert severity="error">{msg}</Alert>
}

export default function Login(props) {
  const [redirectToReferrer, setRedirectToReferrer] = React.useState(false);
  const [msg, setMsg] = React.useState(statusMsg("Please log in."));
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const loginDisabled = username === "" || password === "";

  const login = function () {
    BingoApi
      .login(username, password)
      .then((result) => {
        console.log("login result " + result.status);

        setMsg((result.status) ?
          statusMsg(result.msg) :
          errorMsg(result.msg));

        setRedirectToReferrer(result.status);
      })
  }

  const handleUserNameChange = function (e) {
    setUsername(e.target.value);
  }

  const handlePasswordChange = function (e) {
    setPassword(e.target.value);
  }

  /**
   * as a convenience, we start the login process
   * if someone presses enter from the password field.
   * 
   * @param {Object} e key event
   */
  const handleEnterKey = function (e) {
    if (e.key === "Enter") {
      login();
    }
  }

  const { from } = props.location.state || {
    from: {
      pathname: '/'
    }
  }

  if (redirectToReferrer === true) {
    console.log("Redirecting to : " + from.pathname);
    return <Redirect to={from} />
  }

  return (
    <Dashboard>
      <Container maxWidth="xs">
        <Title>Login</Title>

        {msg}

        <TextField
          placeholder="PWCC User Name"
          margin="normal"
          fullWidth
          label="User Name"
          onChange={handleUserNameChange} />

        <TextField
          type="password"
          label="password"
          margin="normal"
          fullWidth
          onChange={handlePasswordChange}
          onKeyPress={handleEnterKey} />

        <Button
          fullWidth
          variant="contained"
          disabled={loginDisabled}
          color="primary"
          onClick={login}
        >
          Log In
        </Button>

      </Container>

    </Dashboard>
  )
}
