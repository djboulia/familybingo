import React from 'react';
import { LinearProgress } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import Title from './Title';
import Dashboard from './Dashboard';
import BingoApi from './server/BingoApi';
import BingoCard from './bingocards/BingoCard';

export default function Card(props) {
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const [name, setName] = React.useState('');
  const [card, setCard] = React.useState([]);
  const [errMsg, setErrMsg] = React.useState("");

  React.useEffect(() => {
    const user = BingoApi.getUser();
    setName(user.name);

    const gameid = props.match.params.id;
    console.log('params ', gameid);

    BingoApi.cards(gameid)
      .then((cards) => {
        setCard(cards[0]);
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

    const gameid = props.match.params.id;

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
      })
  };

  if (errMsg != "") {
    console.log("Errmsg: " + errMsg);
    return <Alert severity="error">{errMsg}</Alert>
  }

  if (!hasLoaded) {
    return <LinearProgress></LinearProgress>
  }

  return (
    <Dashboard>

      <Title>Bingo Card for {name}</Title>

      <BingoCard card={card.rows} onClick={handleClick} />

    </Dashboard>
  );
}