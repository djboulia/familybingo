
'use strict';

const FileDB = require('./utils/filedb');

const findPlayerByUserid = function (players, userid) {
    return new Promise((resolve, reject) => {
        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            if (player.userid === userid) {
                resolve(player);
                return;
            }
        }

        reject('player ' + userid + ' not found!');
    })
}

module.exports = function(path) {
    const FILE = path + '/players.json';
    const fileDB = new FileDB(FILE);

    this.getAll = function () {
        return fileDB.getAll();
    }

    this.getById = function (id) {
        return fileDB.getById(id);
    }

    this.authenticate = function (userid, password) {
        const err = 'Invalid userid or password';

        return new Promise((resolve, reject) => {
            if (!userid || !password) {
                reject(err);
                return;
            }

            fileDB.getAll()
                .then((players) => {
                    return findPlayerByUserid(players, userid);
                })
                .then((player) => {
                    if (player.password !== password) {
                        reject(err);
                        return;
                    }

                    const result = {
                        _id: player._id,
                        name: player.name,
                        admin: player.admin,
                        token: 'Dummy_Token',
                        ttl: 3600 * 1000       // 1 hour
                    };
                    resolve(result);
                })
                .catch((e) => {
                    reject(err);
                    return;
                })
        })
    }

};