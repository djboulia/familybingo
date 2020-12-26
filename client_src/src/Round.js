import React from 'react';
import { LinearProgress } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Alert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';
import Title from './Title';
import Dashboard from './Dashboard';
import BingoApi from './server/BingoApi';
import BingoCardSmall from './bingocards/BingoCardSmall';

export default function Round(props) {
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState("");
  const [name, setName] = React.useState("");
  const [game, setGame] = React.useState({});

  const gameId = props.match.params.id;
  const roundId = props.match.params.roundid;

  React.useEffect(() => {
    const user = BingoApi.getUser();
    setName(user.name);

    console.log('params ' + gameId + ' round ' + roundId);

    BingoApi.round(gameId, roundId)
      .then((game) => {
        setName(game.name);
        setGame(game);
        setHasLoaded(true);
      })
      .catch((e) => {
        setErrMsg(e);
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

      <Title>Game Summary for {name}  (Round {Number(roundId) +1})</Title>

      <Grid container justify="center" spacing={2}>
      <Grid item xs={6}
          style={{
            textAlign: 'center' // this does the magic
          }}>
          <Button color='secondary' variant='contained' href={'/games/' + gameId + '/cards/round/' + roundId}>
            View My Card
            </Button>
        </Grid>

        <Grid item xs={6}
          style={{
            textAlign: 'center' // this does the magic
          }}>
          <Button color='secondary' variant='contained' href={'/games/' + gameId}>
            Return to Game
        </Button>
        </Grid>

        {game.players.map((player) => (
          <Grid key={player._id} item>
            <BingoCardSmall player={player} />
          </Grid>
        ))}
      </Grid>

    </Dashboard>
  );
}