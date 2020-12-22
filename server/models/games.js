
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

    /**
     * Get all of the cards for this user in this game
     * 
     * @param {String} gameid 
     * @param {String} userid 
     */
    getAllCardIds: function (gameid, userid) {
        return new Promise((resolve, reject) => {

            fileDB.getById(gameid)
                .then((game) => {

                    const rounds = game.rounds;
                    const result = [];

                    for (let i=0; i<rounds.length; i++) {
                        const round = rounds[i];
                        result[i] = undefined;

                        for (let j = 0; j < round.length; j++) {
                            const card = round[j];
    
                            if (card.user === userid) {
                                const cardid = card.card;
                                result[i] = cardid;
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

    getByUser: function (id) {
        return new Promise((resolve, reject) => {

            fileDB.getAll()
                .then((games) => {
                    const result = [];

                    for (let i = 0; i < games.length; i++) {
                        const game = games[i];
                        const players = game.players;

                        for (let j = 0; j < players.length; j++) {
                            const playerId = players[j];

                            if (playerId === id) {
                                result.push({
                                    id: game.id,
                                    name: game.name,
                                    complete: game.complete
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

    update: function (game) {
        return new Promise((resolve, reject) => {

            fileDB.update(game)
                .then((game) => {
                    resolve(game);
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