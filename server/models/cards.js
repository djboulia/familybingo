
'use strict';

require("dotenv").config();

const FileDB = require('./utils/filedb');

const FILE = process.env.TEST_DATA_PATH + '/cards.json';
const fileDB = new FileDB(FILE);

const getCardData = function (card) {
    // extract only the card data we want to save
    const result = [];

    for (let i = 0; i < card.length; i++) {
        const row = card[i];
        const resultRow = [];

        for (let j = 0; j < row.length; j++) {
            const cell = row[j];

            resultRow.push({
                text: cell.text,
                selected: cell.selected,
                freeSpace: cell.freeSpace
            })
        }

        result.push(resultRow);
    }

    return result;
}

const updateForBingo = function (card, bingoCells) {

    // bingoCells is an array of row,col pairs representing bingo
    // look to see if we have a valid bingo first
    // if so, set the bingo flag for these cells

    let bingo = true;
    for (let i = 0; i < bingoCells.length; i++) {
        const x = bingoCells[i][0];
        const y = bingoCells[i][1];
        const row = card[x];
        const cell = row[y];

        // if they're not all selected or all free spaces,
        // then it's not a valid bingo
        if (!cell.selected && !cell.freeSpace) {
            bingo = false;
            break;
        }
    }

    if (bingo) {
        for (let i = 0; i < bingoCells.length; i++) {
            const x = bingoCells[i][0];
            const y = bingoCells[i][1];
            const cell = card[x][y];

            cell.bingo = true;
        }
    }
}

const updateBingoCard = function (card) {
    // make a copy of the data with bingo 
    // flags set to false initially
    const result = [];

    for (let i = 0; i < card.length; i++) {
        const row = card[i];
        const resultRow = [];

        for (let j = 0; j < row.length; j++) {
            const cell = row[j];
            cell.bingo = false;

            resultRow.push({
                text: cell.text,
                selected: cell.selected,
                freeSpace: cell.freeSpace,
                bingo: false
            })
        }

        result.push(resultRow);
    }

    // the various kinds of bingo
    // each array is a set of cells that represent
    // a valid bingo.  rows, columns and diagonals
    const rows = [
        [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
        [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4]],
        [[2, 0], [2, 1], [2, 2], [2, 3], [2, 4]],
        [[3, 0], [3, 1], [3, 2], [3, 3], [3, 4]],
        [[4, 0], [4, 1], [4, 2], [4, 3], [4, 4]],
    ];
    const cols = [
        [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
        [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1]],
        [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]],
        [[0, 3], [1, 3], [2, 3], [3, 3], [4, 3]],
        [[0, 4], [1, 4], [2, 4], [3, 4], [4, 4]],
    ];
    const diagonals = [
        [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]],
        [[0, 4], [1, 3], [2, 2], [3, 1], [4, 0]]
    ];

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i];
        updateForBingo(result, cells);
    }

    for (let i = 0; i < cols.length; i++) {
        const cells = cols[i];
        updateForBingo(result, cells);
    }

    for (let i = 0; i < diagonals.length; i++) {
        const cells = diagonals[i];
        updateForBingo(result, cells);
    }

    return result;
}

module.exports = {
    getById: function (id) {
        return new Promise((resolve, reject) => {
            const result = [];

            fileDB.getById(id)
                .then((card) => {
                    resolve({
                        id: id,
                        rows: updateBingoCard(card.rows)
                    });
                    return;
                })
                .catch((e) => {
                    reject(e);
                })

        })
    },

    update: function (card) {
        return new Promise((resolve, reject) => {

            fileDB.update({
                id: card.id,
                rows: getCardData(card.rows)
            })
                .then((card) => {
                    resolve({
                        id: card.id,
                        rows: updateBingoCard(card.rows)
                    });
                })
                .catch((e) => {
                    reject(e);
                })
        })
    },

    create: function (cardData) {
        return new Promise((resolve, reject) => {

            fileDB.create(cardData)
                .then((card) => {
                    resolve(card);
                })
                .catch((e) => {
                    reject(e);
                })

        })
    }

};