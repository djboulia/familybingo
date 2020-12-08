
'use strict';

require("dotenv").config();

const FileDB = require('./utils/filedb');

const FILE = process.env.TEST_DATA_PATH + '/players.json';
const fileDB = new FileDB(FILE);

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

module.exports = {
    getAll: function () {
        return fileDB.getAll();
    },

    getById: function (id) {
        return fileDB.getById(id);
    },

    authenticate: function (userid, password) {
        const err = {
            status: false,
            msg: 'Invalid userid or password'
        };

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
                        name: player.name,
                        id: player.id,
                        token: 'Dummy_Token',
                        ttl: 3600 * 1000,       // 1 hour
                        status: true,
                        msg: 'success'
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