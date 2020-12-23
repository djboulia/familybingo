import React from 'react';
import { Redirect } from 'react-router-dom'
import { Button, TextField } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Alert from '@material-ui/lab/Alert';
import Dashboard from './Dashboard';
import Title from './Title';
import BingoApi from './server/BingoApi';

const statusAlert = (msg) => {
  return <Alert severity="info">{msg}</Alert>
}

const errorAlert = (msg) => {
  return <Alert severity="error">{msg}</Alert>
}

export default function Login(props) {
  const [redirectToReferrer, setRedirectToReferrer] = React.useState(false);
  const [statusMsg, setStatusMsg] = React.useState('Please log in.');
  const [errorMsg, setErrorMsg] = React.useState(undefined);
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const loginDisabled = username === "" || password === "";

  const login = function () {
    BingoApi.login(username, password)
      .then((result) => {
        console.log("login result " + result.status);

        setStatusMsg(result.msg);

        setRedirectToReferrer(result.status);
      })
      .catch((e) => {
        console.log('Error ' + e);
        setErrorMsg(e);
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

  const msg = (errorMsg) ? errorAlert(errorMsg) : statusAlert(statusMsg);

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
