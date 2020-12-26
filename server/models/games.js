
'use strict';

const DBHelper = require('./dbhelper');

module.exports = function (cloudant) {

    const db = cloudant.db.use('familybingo')

    this.getById = function (gameid) {
        return DBHelper.getById(db, gameid);
    }

    this.getByUser = function (id) {
        return new Promise((resolve, reject) => {

            DBHelper.getAll(db, "game")
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
        return DBHelper.update(db, game);
    }

    this.create = function (gameData) {
        return DBHelper.create(db, 'game', gameData);
    }

};