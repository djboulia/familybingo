
'use strict';

require("dotenv").config();

const FileDB = require('./utils/filedb');

const FILE = process.env.TEST_DATA_PATH + '/games.json';
const fileDB = new FileDB(FILE);

module.exports = {
    getById: function (gameid) {
        return new Promise((resolve, reject) => {

            fileDB.getById(gameid)
                .then((game) => {
                    resolve(game);
                })
                .catch((e) => {
                    reject(e);
                })
        })
    },

    getCardId: function (gameid, userid) {
        return new Promise((resolve, reject) => {

            fileDB.getById(gameid)
                .then((game) => {
                    const players = game.players;

                    for (let j = 0; j < players.length; j++) {
                        const player = players[j];

                        if (player.id === userid) {
                            const cardid = player.card;
                            resolve(cardid);
                            return;
                        }
                    }

                    reject('no card found for ' + userid);
                })
                .catch((e) => {
                    reject(e);
                })
        })
    },

    getByUser: function (id) {
        return new Promise((resolve, reject) => {

            fileDB.getAll()
                .then((games) => {
                    const result = [];

                    for (let i = 0; i < games.length; i++) {
                        const game = games[i];
                        const players = game.players;

                        for (let j = 0; j < players.length; j++) {
                            const player = players[j];

                            if (player.id === id) {
                                result.push({
                                    id: game.id,
                                    name: game.name
                                });
                                break;
                            }
                        }
                    }

                    resolve(result);
                })
                .catch((e) => {
                    reject(e);
                })

        })
    },
    create: function (gameData) {
        return new Promise((resolve, reject) => {

            const game = {
                name: gameData.name,
                topic: gameData.topicId,
                startDate: gameData.startDate,
                endData: gameData.endDate,
                players: gameData.players,

            }

            fileDB.create(gameData)
                .then((result) => {
                    resolve(result);
                })
                .catch((e) => {
                    reject(e);
                })
        })
    }

};