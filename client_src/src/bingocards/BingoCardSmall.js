import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Circle from '@material-ui/icons/Lens';
import Star from '@material-ui/icons/Star';

const cardWidth = 300;

const useStyles = makeStyles((theme) => ({
  bingoTable: {
    maxWidth: `${cardWidth}px`,
    borderTopLeftRadius: '10px',
    borderTopRightRadius: '10px',
    borderCollapse: 'separate',
    border: '1px solid black',
  },
  bingoTitle: {
    maxWidth: `${cardWidth}px`,
    color: 'white',
    backgroundColor: theme.palette.secondary.main,
    padding: '10px',
    borderTopLeftRadius: '10px',
    borderTopRightRadius: '10px',
    border: '0px',
  },
  bingoHeader: {
    textAlign: 'center',
    color: 'white',
    backgroundColor: theme.palette.secondary.main,
    border: '0px',
    padding: '0px',
  },
  bingoCell: {
    width: `${cardWidth / 5}px`,
    height: `${cardWidth / 5}px`,
    textAlign: 'center',
    border: '1px solid gray',
    padding: '0px',
  },
  bingoHighlight: {
    backgroundColor: 'yellow',
  },
}));

const bingoSquare = function (el) {
  const classes = useStyles();

  return (
    <TableCell className={clsx(classes.bingoCell, el.bingo && classes.bingoHighlight)}>{(el.freeSpace) ? <Star color='primary' /> : (el.selected) ? <Circle color='secondary' /> : ''}</TableCell>
  )
}

export default function BingCardSmall(props) {
  const classes = useStyles();
  const player = props.player;
  const card = player.card;

  return (
    <Table key={player.id} className={classes.bingoTable}>

      <TableHead>
        <TableRow >
          <TableCell colSpan={5} align='center' className={classes.bingoTitle}>{player.name}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={classes.bingoHeader}>B</TableCell>
          <TableCell className={classes.bingoHeader}>I</TableCell>
          <TableCell className={classes.bingoHeader}>N</TableCell>
          <TableCell className={classes.bingoHeader}>G</TableCell>
          <TableCell className={classes.bingoHeader}>O</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {card.rows.map((row, index) => {

          return (
            <TableRow key={index}>
              {bingoSquare(row[0])}
              {bingoSquare(row[1])}
              {bingoSquare(row[2])}
              {bingoSquare(row[3])}
              {bingoSquare(row[4])}
            </TableRow>
          )

        })}

      </TableBody>

    </Table>
  );
}