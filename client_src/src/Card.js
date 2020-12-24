import React from 'react';
import { Redirect } from 'react-router-dom'
import { LinearProgress } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import { DialogActions, DialogContent } from '@material-ui/core';
import Title from './Title';
import Dashboard from './Dashboard';
import BingoApi from './server/BingoApi';
import BingoCard from './bingocards/BingoCard';

export default function Card(props) {
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const [name, setName] = React.useState('');
  const [gameName, setGameName] = React.useState(undefined);
  const [card, setCard] = React.useState({});
  const [roundComplete, setRoundComplete] = React.useState(false);
  const [redirect, setRedirect] = React.useState(undefined);
  const [errMsg, setErrMsg] = React.useState("");

  const gameid = props.match.params.id;
  const roundid = props.match.params.roundid;

  React.useEffect(() => {
    const user = BingoApi.getUser();
    setName(user.name);

    console.log('params  game:' + gameid + ', round: ' + roundid);

    BingoApi.card(gameid, roundid)
      .then((card) => {
        console.log('found card ' + card.id);
        setCard(card);

        return BingoApi.game(gameid)
      })
      .then((game) => {
        console.log('found game ' + game.name + ' card is ', card);
        setGameName(game.name);

        setHasLoaded(true);
      })
      .catch((e) => {
        setErrMsg(e);
      })

    }, []);

  /**
   * update the card data on the back end when a 
   * square is clicked
   * 
   * @param {Number} row 
   * @param {Number} col 
   */
  const handleClick = function (row, col) {
    console.log('Card: clicked ' + row + ', ' + col);

    const cell = card.rows[row][col];
    cell.selected = !cell.selected;
    card.rows[row][col] = cell;

    BingoApi.cardUpdate(gameid, card)
      .then((card) => {
        console.log("update complete");
        setCard(card);
      })
      .catch((e) => {
        setErrMsg(e);

        // there's a chance that someone got bingo between
        // updates, so if that happens display a dialog
        if (e === 'Round is already complete') {
          setRoundComplete(true);
        } else if (e === 'Game is over') {
          setRoundComplete(true);
        }
      })
  };

  const handleModalClosed = function () {
    console.log("modal closed");
    setRedirect('/games/' + gameid + '/round/' + roundid);
  }

  if (redirect) {
    return <Redirect to={redirect} />
  }

  if (roundComplete) {
    console.log("round complete");
    return (
      <Dialog
        fullWidth={true}
        maxWidth="sm"
        aria-labelledby="simple-dialog-title"
        open={roundComplete}
      >
        <DialogTitle id="simple-dialog-title">Round Complete</DialogTitle>

        <DialogContent>
          {errMsg}
        </DialogContent>

        <DialogActions>
          <Button variant="contained" color="secondary" onClick={handleModalClosed}>OK</Button>
        </DialogActions>

      </Dialog>
    )
  }

  if (errMsg != "") {
    console.log("Errmsg: " + errMsg);
    return <Alert severity="error">{errMsg}</Alert>
  }

  if (!hasLoaded) {
    return <LinearProgress></LinearProgress>
  }

  return (
    <Dashboard>
      <Title>{gameName}  (Round {Number(roundid)+1})</Title>

      <Grid container
        spacing={3}
        alignItems='center'
        justify='center'
      >
        <Grid item xs={6}
          style={{
            textAlign: 'center' // this does the magic
          }}>
          <Button color='secondary' variant='contained' href={'/games/' + gameid + '/round/' + roundid}>
            View Round Status
            </Button>
        </Grid>

        <Grid item xs={6}
          style={{
            textAlign: 'center' // this does the magic
          }}>
          <Button color='secondary' variant='contained' href={'/games/' + gameid}>
            Return to Game
        </Button>
        </Grid>

        <Grid item xs={12}>
          <BingoCard name={name} card={card.rows} onClick={handleClick} />
        </Grid>

      </Grid>


    </Dashboard>
  );
}