
'use strict';

const FileDB = require('./utils/filedb');

module.exports = function(path) {
    const FILE = path + '/games.json';
    const fileDB = new FileDB(FILE);

    this.getById = function (gameid) {
        return fileDB.getById(gameid);
    }

    this.getByUser = function (id) {
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
                                    _id: game._id,
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
    }

    this.update = function (game) {
        return new Promise((resolve, reject) => {

            fileDB.update(game)
                .then((game) => {
                    resolve(game);
                })
                .catch((e) => {
                    reject(e);
                })
        })
    }

    this.create = function (gameData) {
        return new Promise((resolve, reject) => {

            gameData.class = 'game';

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