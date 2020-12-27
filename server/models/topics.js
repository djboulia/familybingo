'use strict';

module.exports = function (db) {

    this.getById = function (id) {
        return db.getById(id);
    }
};