import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Star from '@material-ui/icons/Star';

const cardWidth = 400;

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
    backgroundColor: theme.palette.bingoCard.header,
    padding: '10px',
    borderTopLeftRadius: '10px',
    borderTopRightRadius: '10px',
    border: '0px',
  },
  bingoHeader: {
    textAlign: 'center',
    color: 'white',
    backgroundColor: theme.palette.bingoCard.header,
    border: '0px',
    padding: '0px',
  },
  bingoCell: {
    fontSize: '12px',
    width: `${cardWidth / 5}px`,
    height: `${cardWidth / 5}px`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    textAlign: 'center',
    padding: '5px',
  },
  tableCell: {
    border: '1px solid gray',
    padding: '0px',
  },
  tableCellBingo: {
    // border: '1px solid ' + theme.palette.bingoCard.bingo,
    border: '1px solid gray',
    padding: '0px',
  },
  selectedHighlight: {
    color: 'black',
    backgroundImage: 'radial-gradient(' + theme.palette.bingoCard.selected + ' 40%, transparent 20%);'
  },
  bingoHighlight: {
    color: 'black',
    backgroundColor: theme.palette.bingoCard.bingo,
    backgroundImage: 'radial-gradient(' + theme.palette.bingoCard.selected + ' 40%, transparent 10%);'
  },
}));

export default function BingCardSmall(props) {
  const classes = useStyles();
  const card = props.card;
  const name = props.name;

  /**
   * reflect a clicked cell to the parent's onClick handler
   */
  const handleClick = function (rowNum, colNum) {
    // console.log('click : (' + rowNum + ', ' + colNum + ')');

    if (props.onClick) {
      props.onClick(rowNum, colNum);
    }
  };

  const bingoSquare = function (rowNum, colNum, row) {
    const el = row[colNum];
    const text = el.text.toUpperCase();
    const classes = useStyles();

    if (el.freeSpace) {
      return <TableCell className={el.bingo ? classes.tableCellBingo : classes.tableCell}><div className={clsx(classes.bingoCell, !el.bingo && classes.selectedHighlight, el.bingo && classes.bingoHighlight)}><Star /></div></TableCell>
    }

    if (el.bingo) {
      return <TableCell onClick={() => handleClick(rowNum, colNum)} className={classes.tableCellBingo}><div className={clsx(classes.bingoCell, el.bingo && classes.bingoHighlight)}>{text}</div></TableCell>
    }

    return <TableCell onClick={() => handleClick(rowNum, colNum)} className={classes.tableCell}><div className={clsx(classes.bingoCell, el.selected && classes.selectedHighlight)}>{text}</div></TableCell>
  };

  return (
    <Table align='center' className={classes.bingoTable}>

      <TableHead>
        <TableRow >
          <TableCell colSpan={5} align='center' className={classes.bingoTitle}>{name}</TableCell>
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
        {card.map((row, index) => {

          return (
            <TableRow key={index}>
              {bingoSquare(index, 0, row)}
              {bingoSquare(index, 1, row)}
              {bingoSquare(index, 2, row)}
              {bingoSquare(index, 3, row)}
              {bingoSquare(index, 4, row)}
            </TableRow>
          )

        })}

      </TableBody>

    </Table>
  );
}