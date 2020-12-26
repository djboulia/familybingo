'use strict';

const DBHelper = require('./dbhelper');

module.exports = function (cloudant) {

    const db = cloudant.db.use('familybingo')

    this.getById = function (id) {
        return DBHelper.getById(db, id);
    }
};