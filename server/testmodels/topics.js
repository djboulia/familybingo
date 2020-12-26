
'use strict';

const FileDB = require('./utils/filedb');

module.exports = function (path) {
    const FILE = path + '/topics.json';
    const fileDB = new FileDB(FILE);

    this.getById = function (id) {
        return fileDB.getById(id);
    }
};