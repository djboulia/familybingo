import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { LinearProgress } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import Alert from '@material-ui/lab/Alert';
import Title from './Title';
import Dashboard from './Dashboard';
import BingoApi from './server/BingoApi';

// Generate Playlist Data

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

export default function Games() {
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState("");
  const [name, setName] = React.useState("");
  const [games, setGames] = React.useState([]);

  React.useEffect(() => {
    const user = BingoApi.getUser();
    setName(user.name);

    BingoApi.games()
      .then((games) => {
            setGames(games);
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

      <Title>Bingo Games for {name}</Title>

      <Table size="small">

        <TableHead>
          <TableRow>
            <TableCell>Game</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align='center'>View</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {games.map((row) => (
            <TableRow key={row._id}>
              <TableCell>
                {row.name}
              </TableCell>
              <TableCell>
                {(row.complete) ? 'Complete' : 'In Progress'}
              </TableCell>
              <TableCell align='center'>
                <Button color='primary' variant='contained' href={'/games/' + row._id}>
                  View Game
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

      </Table>
    </Dashboard>
  );
}