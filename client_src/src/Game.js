import React from 'react';
import { LinearProgress } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Alert from '@material-ui/lab/Alert';
import Title from './Title';
import Dashboard from './Dashboard';
import BingoApi from './server/BingoApi';
import BingoCardSmall from './bingocards/BingoCardSmall';

export default function Game(props) {
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState("");
  const [name, setName] = React.useState("");
  const [game, setGame] = React.useState({});

  React.useEffect(() => {
    const user = BingoApi.getUser();
    setName(user.name);

    const id = props.match.params.id;
    console.log('params ', id);

    BingoApi.game(id)
      .then((game) => {
        setName(game.name);
        setGame(game);
        setHasLoaded(true);
      })
  }, []);

  if (errMsg != "") {
    console.log("Errmsg: " + errMsg);
    return <Alert severity="error">{errMsg}</Alert>
  }

  if (!hasLoaded) {
    return <LinearProgress></LinearProgress>
  }

  return (
    <Dashboard>

      <Title>Game Summary for {name}</Title>

      <Grid container justify="center" spacing={2}>
        {game.players.map((player) => (
          <Grid key={player.id} item>
            <BingoCardSmall player={player} />
          </Grid>
        ))}
      </Grid>

    </Dashboard>
  );
}