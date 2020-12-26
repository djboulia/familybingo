
'use strict';

const DBHelper = require('./dbhelper');

module.exports = function (cloudant) {

    const db = cloudant.db.use('familybingo')

    this.getAll = function () {
        return DBHelper.getAll(db, "player");
    }

    this.getById = function (id) {
        return DBHelper.getById(db, id);
    }

    this.getByUserid = function (userid) {
        return new Promise((resolve, reject) => {
            db.find({ selector: { class: "player", userid: userid } }, function (err, result) {
                if (err) {
                    reject(err);
                    return;
                }

                console.log('Found documnts with id ');
                for (var i = 0; i < result.docs.length; i++) {
                    console.log('  Doc id: %s', result.docs[i]._id);
                }

                resolve(result.docs[0]);
            });
        })
    }

    this.authenticate = function (userid, password) {
        const err = 'Invalid userid or password';
        const self = this;

        return new Promise((resolve, reject) => {
            if (!userid || !password) {
                reject(err);
                return;
            }

            self.getByUserid(userid)
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
                    reject(e);
                    return;
                })
        })
    }

};