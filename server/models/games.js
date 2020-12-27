
'use strict';

module.exports = function (db) {

    this.getById = function (gameid) {
        return db.getById(gameid);
    }

    this.getByUser = function (id) {
        return new Promise((resolve, reject) => {

            db.getAll()
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
        return db.update(game);
    }

    this.create = function (gameData) {
        return db.create(gameData);
    }

};