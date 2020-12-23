import React from 'react';
import { LinearProgress } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import Title from './Title';
import Dashboard from './Dashboard';
import BingoApi from './server/BingoApi';

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

  const activeRound = game.activeRound;
  const rounds = [];
  for (let i = 0; i < game.totalRounds; i++) {
    rounds.push({
      id: i,
      round: i + 1,
      status: (game.complete) ? 'Complete' : (i < activeRound) ? 'Complete' : (i === activeRound) ? 'Active' : 'Not Started',
    })
  }

  return (
    <Dashboard>

      <Title>Game Summary for {name}</Title>

      <Table size="small">

        <TableHead>
          <TableRow>
            <TableCell>Round</TableCell>
            <TableCell align='center'>Status</TableCell>
            <TableCell align='center'>View</TableCell>
            <TableCell align='center'>View</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rounds.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                {row.round}
              </TableCell>
              <TableCell align='center'>
                {row.status}
              </TableCell>
              <TableCell align='center'>
                <Button color='primary' disabled={row.status === 'Not Started'} variant='contained' href={'/games/' + game.id + '/cards/round/' + row.id}>
                  My Card
                </Button>
              </TableCell>
              <TableCell align='center'>
                <Button color='primary' disabled={row.status === 'Not Started'} variant='contained' href={'/games/' + game.id + '/round/' + row.id}>
                  View Round
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

      </Table>
    </Dashboard>
  );
}