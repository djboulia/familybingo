
'use strict';

require("dotenv").config();

const FileDB = require('./utils/filedb');

const FILE = process.env.TEST_DATA_PATH + '/topics.json';
const fileDB = new FileDB(FILE);

module.exports = {
    getById: function (id) {
        return fileDB.getById(id);
    },
};